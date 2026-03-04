import requests

url = "http://localhost:8000/api/billing/invoices/"
resp = requests.get(url, headers={"Authorization": "Token ..."})
# I'll just check the db directly via django shell for faster verification instead of mocking a user token
