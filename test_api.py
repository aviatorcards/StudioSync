import requests
import json
import uuid

# First get token
resp = requests.post("http://localhost:8000/api/auth/jwt/create/", json={
    "email": "admin@demo.com",
    "password": "demo123"
})
if resp.status_code != 200:
    print("Login failed:", resp.text)
    exit(1)
    
token = resp.json().get("access")

# Now query lessons
headers = {"Authorization": f"Bearer {token}"}
resp2 = requests.get("http://localhost:8000/api/lessons/", headers=headers, params={
    "start_date": "2026-03-02",
    "end_date": "2026-03-09"
})

print(f"Status: {resp2.status_code}")
data = resp2.json()
if 'results' in data:
    print(f"Count: {data['count']}")
    if len(data['results']) > 0:
        print(f"First lesson ID: {data['results'][0].get('id')}")
else:
    print(data)
