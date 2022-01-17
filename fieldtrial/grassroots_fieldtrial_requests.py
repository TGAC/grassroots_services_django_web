import requests
import json
from django.conf import settings

server_url = settings.SERVER_URL

'''
Get all field trial request from the backend
returns JSON from backend and send to the model
'''
def get_all_fieldtrials():
    list_all_ft_request = {
        "services": [
            {
                "so:name": "Search Field Trials",
                "start_service": true,
                "parameter_set": {
                    "level": "simple",
                    "parameters": [
                        {
                            "param": "FT Keyword Search",
                            "current_value": ""
                        },
                        {
                            "param": "FT Study Facet",
                            "current_value": true
                        },
                        {
                            "param": "FT Results Page Number",
                            "current_value": 0
                        },
                        {
                            "param": "FT Results Page Size",
                            "current_value": 500
                        }
                    ]
                }
            }
        ]
    }
    res = requests.post(server_url, data=json.dumps(list_all_ft_request))
    return json.dumps(res.json())

'''
Search field trials with a given string
returns JSON from backend and send to the model
'''
def search_fieldtrial(str):
    list_all_ft_request = {
        "services": [
            {
                "so:name": "Search Field Trials",
                "start_service": true,
                "parameter_set": {
                    "level": "simple",
                    "parameters": [
                        {
                            "param": "FT Keyword Search",
                            "current_value": str
                        },
                        {
                            "param": "FT Study Facet",
                            "current_value": true
                        },
                        {
                            "param": "FT Results Page Number",
                            "current_value": 0
                        },
                        {
                            "param": "FT Results Page Size",
                            "current_value": 500
                        }
                    ]
                }
            }
        ]
    }
    res = requests.post(server_url, data=json.dumps(list_all_ft_request))
    return json.dumps(res.json())

'''
Get a field trial with a id
returns JSON from backend and send to the model
'''
def get_fieldtrial(id):
    list_all_ft_request = {
        "services": [{
            "start_service": true,
            "so:name": "Search Field Trials",
            "parameter_set": {
                "level": "advanced",
                "parameters": [
                    {
                        "param": "FT Id",
                        "current_value": id
                    },
                    {
                        "param": "FT Trial Facet",
                        "current_value": true
                    },
                    {
                        "param": "FT Results Page Number",
                        "current_value": 0
                    },
                    {
                        "param": "FT Results Page Size",
                        "current_value": 100
                    }
                ]
            }
        }]
    }
    res = requests.post(server_url, data=json.dumps(list_all_ft_request))
    return json.dumps(res.json())

'''
Get a study with a id
returns JSON from backend and send to the model
'''
def get_study(id):
    study_request = {
            "services": [{
                "so:name": "Search Field Trials",
                "start_service": true,
                "parameter_set": {
                    "level": "advanced",
                    "parameters": [{
                        "param": "ST Id",
                        "current_value": id
                    }, {
                        "param": "Get all Plots for Study",
                        "current_value": true
                    }, {
                        "param": "ST Search Studies",
                        "current_value": true
                    }]
                }
            }]
        }
    res = requests.post(server_url, data=json.dumps(study_request))
    return json.dumps(res.json())


'''
Get plots from a study with a study id
returns JSON from backend and send to the model
'''
def get_plot(id):
    plot_request = {
            "services": [{
                "so:name": "Search Field Trials",
                "start_service": true,
                "parameter_set": {
                    "level": "advanced",
                    "parameters": [{
                        "param": "ST Id",
                        "current_value": id
                    }, {
                        "param": "Get all Plots for Study",
                        "current_value": true
                    }, {
                        "param": "ST Search Studies",
                        "current_value": true
                    }]
                }
            }]
        }
    res = requests.post(server_url, data=json.dumps(plot_request))
    return json.dumps(res.json())

