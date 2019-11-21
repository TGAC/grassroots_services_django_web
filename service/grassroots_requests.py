import requests
import json

server_url = "https://grassroots.tools/beta/public_backend"


def get_all_services():
    list_services_req = {"operations": {"operation": "get_all_services"}}
    res = requests.post(server_url, data=json.dumps(list_services_req))
    return json.dumps(res.json())


def get_service(service_name):
    get_service_req = {"services": [{"so:name": service_name}], "operations": {"operation": "get_named_service"}}
    res = requests.post(server_url, data=json.dumps(get_service_req))
    return json.dumps(res.json())


def search_treatment(data):
    res = requests.post(server_url, data=json.dumps(data))
    return json.dumps(res.json())

def submit_form(data):
    res = requests.post(server_url, data=json.dumps(data))
    return json.dumps(res.json())

def check_result(data):
    res = requests.post(server_url, data=json.dumps(data))
    return json.dumps(res.json())