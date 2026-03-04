import requests

class colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    ENDC = '\033[0m'

url = "http://localhost:8000/api/billing/verify-checkout-session/"

def test(session_id):
    resp = requests.post(url, json={"session_id": session_id})
    if resp.status_code == 200:
        print(colors.GREEN + "success" + colors.ENDC)
    else:
        print(colors.RED + f"failed: {resp.status_code} {resp.text}" + colors.ENDC)

print("Make sure you get the session_id from the latest test checkout!")
