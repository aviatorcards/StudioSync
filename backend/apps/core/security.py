"""Request hardening helpers shared by auth, calendar import, and preferences."""

import ipaddress
import socket
from copy import deepcopy
from urllib.parse import urlparse

SECRET_PREFERENCE_KEYS = ("smtp_password", "sms_auth_token")


def assert_public_host(host: str, port: int = 80) -> str:
    """Reject hosts that resolve to loopback, link-local, or private networks."""
    if host is None:
        raise ValueError("Host is required.")
    return assert_public_http_url(f"http://{host}:{port}")


def assert_public_http_url(url: str) -> str:
    """Reject URLs that could reach loopback, link-local, or private networks."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only http and https URLs are allowed.")
    host = parsed.hostname
    if not host:
        raise ValueError("URL is missing a host.")
    lowered = host.lower().rstrip(".")
    if (
        lowered in {"localhost", "metadata", "metadata.google.internal"}
        or lowered.endswith(".local")
        or lowered.endswith(".internal")
        or lowered.endswith(".localhost")
    ):
        raise ValueError("That host is not allowed.")

    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    try:
        infos = socket.getaddrinfo(lowered, port, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise ValueError("Could not resolve that host.") from exc

    addresses = {item[4][0] for item in infos}
    if not addresses:
        raise ValueError("Could not resolve that host.")
    for raw in addresses:
        try:
            ip = ipaddress.ip_address(raw)
        except ValueError as exc:
            raise ValueError("That host is not allowed.") from exc
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        ):
            raise ValueError("That host is not allowed.")
    return url


def redact_preferences(preferences, *, include_technical=False):
    """Drop mailbox and SMS secrets from API responses."""
    if not isinstance(preferences, dict):
        return preferences or {}
    redacted = deepcopy(preferences)
    technical = redacted.get("technical")
    if not include_technical:
        redacted.pop("technical", None)
        return redacted
    if isinstance(technical, dict):
        cleaned = dict(technical)
        for key in SECRET_PREFERENCE_KEYS:
            present = bool(cleaned.get(key))
            cleaned.pop(key, None)
            cleaned[f"{key}_set"] = present
        redacted["technical"] = cleaned
    return redacted


def merge_preferences(existing, incoming):
    """Merge preference dicts. A blank secret keeps the stored secret."""
    if not isinstance(incoming, dict):
        return existing if isinstance(existing, dict) else {}
    base = deepcopy(existing) if isinstance(existing, dict) else {}
    for key, value in incoming.items():
        if key != "technical":
            base[key] = value
            continue
        if not isinstance(value, dict):
            continue
        old_technical = base.get("technical") if isinstance(base.get("technical"), dict) else {}
        merged = dict(old_technical)
        merged.update(value)
        for secret in SECRET_PREFERENCE_KEYS:
            merged.pop(f"{secret}_set", None)
            if not value.get(secret):
                if old_technical.get(secret):
                    merged[secret] = old_technical[secret]
                else:
                    merged.pop(secret, None)
        base["technical"] = merged
    return base


def revoke_user_tokens(user):
    """Blacklist outstanding refresh tokens. No-op if the blacklist app is absent."""
    try:
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
    except Exception:
        return
    for outstanding in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=outstanding)
