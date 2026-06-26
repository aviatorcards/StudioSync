"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Bell,
  Search,
  LogOut,
  GraduationCap,
  FileText,
  BookOpen,
  Menu,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useNotifications, NOTIFICATION_TYPE_META } from "@/hooks/useNotifications";

// ─── Design tokens ────────────────────────────────────────────────────────────
const H = {
  bg: "#faf7f2",
  border: "#e3d4bc",
  text: "#1c1309",
  muted: "#7a6145",
  faint: "#b09870",
  amber: "#c17c2e",
  amberLight: "rgba(193,124,46,0.1)",
  cardBg: "#f0e8d8",
  dropBorder: "#e3d4bc",
  hoverBg: "#f0e8d8",
} as const;

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { currentUser, logout } = useUser();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markRead, markAllRead, clearAll } =
    useNotifications(30000);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotifications]);

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success("All notifications marked as read");
  };

  const handleClearAll = async () => {
    await clearAll();
    toast.success("All notifications cleared");
  };

  const handleNotificationClick = async (
    notification: (typeof notifications)[0]
  ) => {
    if (!notification.read) await markRead(notification.id);
    setShowNotifications(false);
    if (notification.link) router.push(notification.link);
  };

  const getTypeMeta = (type: string) =>
    NOTIFICATION_TYPE_META[type] ?? NOTIFICATION_TYPE_META["system_update"];

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        backgroundColor: H.bg,
        borderBottom: `1px solid ${H.border}`,
      }}
    >
      <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden mr-2"
          style={{ color: H.muted }}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </Button>

        {/* Left: Page Title */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-xl md:text-2xl font-bold truncate"
            style={{ color: H.text, fontFamily: "Outfit, sans-serif" }}
          >
            Dashboard
          </h1>
          <p className="text-xs md:text-sm truncate" style={{ color: H.muted }}>
            Welcome back, {currentUser?.full_name}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
              style={{ color: H.muted }}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 min-w-[8px] h-2 rounded-full border-2 flex items-center justify-center"
                  style={{
                    backgroundColor: H.amber,
                    borderColor: H.bg,
                  }}
                >
                  {unreadCount > 9 && (
                    <span
                      className="text-[7px] font-black leading-none px-0.5"
                      style={{ color: "#fff" }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </span>
              )}
            </Button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-1rem)] rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                style={{
                  backgroundColor: H.bg,
                  border: `1px solid ${H.dropBorder}`,
                  boxShadow: `0 8px 40px rgba(28,19,9,0.12)`,
                }}
              >
                {/* Header */}
                <div
                  className="p-3 flex justify-between items-center"
                  style={{
                    borderBottom: `1px solid ${H.border}`,
                    backgroundColor: H.cardBg,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <h3
                      className="font-bold text-sm"
                      style={{ color: H.text }}
                    >
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none"
                        style={{ backgroundColor: H.amber, color: "#fff" }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-medium hover:underline"
                        style={{ color: H.amber }}
                      >
                        Mark all read
                      </button>
                    )}
                    {unreadCount > 0 && (
                      <span style={{ color: H.border }}>|</span>
                    )}
                    <button
                      onClick={handleClearAll}
                      className="text-xs font-medium hover:underline"
                      style={{ color: H.muted }}
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                {/* List */}
                <div
                  className="max-h-[360px] overflow-y-auto"
                  style={{ borderBottom: `1px solid ${H.border}` }}
                >
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: H.cardBg }}
                      >
                        🔔
                      </div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: H.muted }}
                      >
                        You&apos;re all caught up!
                      </p>
                      <p className="text-xs" style={{ color: H.faint }}>
                        No notifications yet.
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => {
                      const meta = getTypeMeta(n.notification_type);
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className="p-3 flex gap-3 cursor-pointer transition-colors"
                          style={{
                            backgroundColor: !n.read
                              ? "rgba(193,124,46,0.05)"
                              : "transparent",
                            borderBottom: `1px solid ${H.border}`,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = H.hoverBg)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = !n.read
                              ? "rgba(193,124,46,0.05)"
                              : "transparent")
                          }
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${meta.color}`}
                          >
                            {meta.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <p
                                className="text-sm leading-tight truncate"
                                style={{
                                  color: H.text,
                                  fontWeight: !n.read ? 600 : 400,
                                }}
                              >
                                {n.title}
                              </p>
                              {!n.read && (
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                                  style={{ backgroundColor: H.amber }}
                                />
                              )}
                            </div>
                            <p
                              className="text-xs mt-0.5 line-clamp-2"
                              style={{ color: H.muted }}
                            >
                              {n.message}
                            </p>
                            <p
                              className="text-[10px] mt-1 font-medium"
                              style={{ color: H.faint }}
                            >
                              {n.time_ago}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="p-2.5 text-center" style={{ backgroundColor: H.cardBg }}>
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: H.amber }}
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Google Cast */}
          <div
            className="hidden md:flex p-2 rounded-lg w-9 h-9 items-center justify-center"
            style={{ color: H.muted }}
          >
            {/* @ts-ignore */}
            <google-cast-launcher
              style={{ width: "20px", height: "20px", opacity: 0.5 }}
            ></google-cast-launcher>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            style={{ color: H.muted }}
          >
            <Search className="w-5 h-5" />
          </Button>

          <Link href="/dashboard/settings" className="hidden sm:block">
            <Button
              variant="ghost"
              size="icon"
              style={{ color: H.muted }}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 h-auto p-2 rounded-lg"
              style={{ color: H.text }}
            >
              {currentUser?.avatar ? (
                <div
                  className="w-8 h-8 rounded-full overflow-hidden ring-2"
                  style={{ ringColor: H.border }}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                  style={{
                    background: `linear-gradient(135deg, #c17c2e 0%, #7a4010 100%)`,
                  }}
                >
                  {currentUser?.initials}
                </div>
              )}
              <div className="text-left hidden md:block">
                <div
                  className="text-sm font-semibold"
                  style={{ color: H.text }}
                >
                  {currentUser?.full_name}
                </div>
                <div className="text-xs capitalize" style={{ color: H.muted }}>
                  {currentUser?.role === "teacher"
                    ? "Instructor"
                    : currentUser?.role}
                </div>
              </div>
              <span
                className={`text-xs transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                style={{ color: H.faint }}
              >
                ▼
              </span>
            </Button>

            {/* User dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1rem)] rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                  style={{
                    backgroundColor: H.bg,
                    border: `1px solid ${H.dropBorder}`,
                    boxShadow: `0 8px 40px rgba(28,19,9,0.12)`,
                  }}
                >
                  {/* User info */}
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: H.cardBg,
                      borderBottom: `1px solid ${H.border}`,
                    }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: H.amber }}
                    >
                      Signed in as
                    </p>
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: H.text }}
                    >
                      {currentUser?.email}
                    </p>
                  </div>

                  {/* Quick access */}
                  <div
                    className="p-2"
                    style={{ borderBottom: `1px solid ${H.border}` }}
                  >
                    <p
                      className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: H.faint }}
                    >
                      Quick Access
                    </p>
                    {[
                      { href: "/dashboard/lessons", label: "My Lessons", icon: BookOpen },
                      { href: "/dashboard/students", label: "My Students", icon: FileText },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                        style={{ color: H.muted }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = H.hoverBg;
                          e.currentTarget.style.color = H.text;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = H.muted;
                        }}
                      >
                        <div
                          className="p-1.5 rounded-md"
                          style={{ backgroundColor: H.amberLight }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: H.amber }}
                          />
                        </div>
                        <span className="text-sm">{label}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Learning base */}
                  <div
                    className="p-2"
                    style={{ borderBottom: `1px solid ${H.border}` }}
                  >
                    <Link
                      href="/dashboard/resources"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                      style={{
                        backgroundColor: H.amberLight,
                        border: `1px solid ${H.border}`,
                        color: H.text,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgba(193,124,46,0.18)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = H.amberLight)
                      }
                    >
                      <div
                        className="p-1.5 rounded-lg"
                        style={{ backgroundColor: "rgba(193,124,46,0.2)" }}
                      >
                        <GraduationCap
                          className="w-4 h-4"
                          style={{ color: H.amber }}
                        />
                      </div>
                      <div className="flex-1">
                        <span
                          className="block text-sm font-medium"
                          style={{ color: H.text }}
                        >
                          Learning Base
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: H.muted }}
                        >
                          Explore resources & guides
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Settings */}
                  <div
                    className="p-2"
                    style={{ borderBottom: `1px solid ${H.border}` }}
                  >
                    <p
                      className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: H.faint }}
                    >
                      Account
                    </p>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm"
                      style={{ color: H.muted }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = H.hoverBg;
                        e.currentTarget.style.color = H.text;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = H.muted;
                      }}
                    >
                      <Settings className="w-4 h-4" style={{ color: H.faint }} />
                      <span>Settings</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="p-2" style={{ backgroundColor: H.cardBg }}>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-start gap-2 px-3 py-2 text-sm rounded-lg h-auto font-normal"
                      style={{ color: "#b54040" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(181,64,64,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
