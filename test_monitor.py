import requests

url = "http://127.0.0.1:5000/monitor"

data = {
    "length": 120,
    "has_delegatecall": 1,
    "has_call": 1,
    "has_selfdestruct": 0,
    "has_msg_sender": 1
}

res = requests.post(url, json=data)
print(res.json())
