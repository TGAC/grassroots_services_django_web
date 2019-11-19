import requests
import json
from pprint import pprint

server_url = "https://grassroots.tools/beta/public_backend"


def get_all_services():
    list_services_req = {"operations": {"operation": "get_all_services"}}

    req = requests.post(server_url, data=json.dumps(list_services_req))
    return json.dumps(req.json())
