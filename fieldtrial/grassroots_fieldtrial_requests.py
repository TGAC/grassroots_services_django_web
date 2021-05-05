import requests
import json
from django.conf import settings

server_url = settings.SERVER_URL


def get_all_fieldtrials():
    list_all_ft_request = {
        "services": [
            {
                "so:name": "Search Field Trials",
                "start_service": True,
                "parameter_set": {
                    "level": "simple",
                    "parameters": [
                        {
                            "param": "FT Keyword Search",
                            "current_value": ""
                        },
                        {
                            "param": "FT Study Facet",
                            "current_value": True
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

def search_fieldtrial(str):
    list_all_ft_request = {
        "services": [
            {
                "so:name": "Search Field Trials",
                "start_service": True,
                "parameter_set": {
                    "level": "simple",
                    "parameters": [
                        {
                            "param": "FT Keyword Search",
                            "current_value": "luzie"
                        },
                        {
                            "param": "FT Study Facet",
                            "current_value": True
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

def get_fieldtrial(id):
    list_all_ft_request = {
        "services": [{
            "start_service": True,
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
                        "current_value": True
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

def get_study(id):
    study_request = {
            "services": [{
                "so:name": "Search Field Trials",
                "start_service": True,
                "parameter_set": {
                    "level": "advanced",
                    "parameters": [{
                        "param": "ST Id",
                        "current_value": id
                    }, {
                        "param": "Get all Plots for Study",
                        "current_value": True
                    }, {
                        "param": "ST Search Studies",
                        "current_value": True
                    }]
                }
            }]
        }
    res = requests.post(server_url, data=json.dumps(study_request))
    return json.dumps(res.json())

def get_plot(id):
    plot_request = {
            "services": [{
                "so:name": "Search Field Trials",
                "start_service": True,
                "parameter_set": {
                    "level": "advanced",
                    "parameters": [{
                        "param": "ST Id",
                        "current_value": id
                    }, {
                        "param": "Get all Plots for Study",
                        "current_value": True
                    }, {
                        "param": "ST Search Studies",
                        "current_value": True
                    }]
                }
            }]
        }
    res = requests.post(server_url, data=json.dumps(plot_request))
    return json.dumps(res.json())

#
# def get_service(service_name):
#     get_service_req = {"services": [{"so:name": service_name}], "operations": {"operation": "get_named_service"}}
#     res = requests.post(server_url, data=json.dumps(get_service_req))
#     return json.dumps(res.json())
#
#
# def interact_backend(data):
#     res = requests.post(server_url, data=json.dumps(data))
#     return json.dumps(res.json())
#
#
# def search_treatment(data):
#     res = requests.post(server_url, data=json.dumps(data))
#     return json.dumps(res.json())
#
#
# def submit_form(data):
#     res = requests.post(server_url, data=json.dumps(data))
#     return json.dumps(res.json())
#
#
# def check_result(data):
#     res = requests.post(server_url, data=json.dumps(data))
#     return json.dumps(res.json())
#
#
# def search_treatment_return_ols(string):
#     submit_json = {
#         "services": [
#             {
#                 "start_service": True,
#                 "so:name": "Search Field Trials",
#                 "parameter_set": {
#                     "level": "simple",
#                     "parameters": [
#                         {
#                             "param": "FT Keyword Search",
#                             # "current_value": f"{string}*"
#                             "current_value": "{}*".format(string)
#                         },
#                         {
#                             "param": "FT Facet",
#                             "current_value": "Measured Variable"
#                         },
#                         {
#                             "param": "FT Results Page Number",
#                             "current_value": 0
#                         },
#                         {
#                             "param": "FT Results Page Size",
#                             "current_value": 500
#                         }
#                     ]
#                 }
#             }
#         ]
#     }
#     res = requests.post(server_url, data=json.dumps(submit_json))
#     res_json = res.json()
#
#     num_found = res_json['results'][0]['metadata']['total_hits']
#
#     if num_found > 0:
#         results = res_json['results'][0]['results']
#         docs_results = []
#
#         response_json = {
#             "responseHeader": {
#                 "status": 0,
#                 "response": {
#                     # "numFound": 2,
#                     "start": 0
#                     # ,
#                     # "docs": [{
#                     #     "id": "cco:http://identifiers.org/uniprot/Q9M339",
#                     #     "iri": "http://identifiers.org/uniprot/Q9M339",
#                     #     "short_form": "Q9M339",
#                     #     "label": "RS32_ARATH",
#                     #     "ontology_name": "cco",
#                     #     "ontology_prefix": "CCO",
#                     #     "type": "class"
#                     # },
#                     #     {
#                     #         "id": "ncbitaxon:class:http://purl.obolibrary.org/obo/NCBITaxon_467564",
#                     #         "iri": "http://purl.obolibrary.org/obo/NCBITaxon_467564",
#                     #         "short_form": "NCBITaxon_467564",
#                     #         "obo_id": "NCBITaxon:467564",
#                     #         "label": "bacterium RS32G",
#                     #         "ontology_name": "ncbitaxon",
#                     #         "ontology_prefix": "NCBITAXON",
#                     #         "type": "class"
#                     #     }
#                     # ],
#                     # "highlighting": {
#                     #     "cco:http://identifiers.org/uniprot/Q9M339": {
#                     #         "label_autosuggest": [
#                     #             "<b>RS32_ARATH</b>"
#                     #         ]
#                     #     },
#                     #     "ncbitaxon:class:http://purl.obolibrary.org/obo/NCBITaxon_467564": {
#                     #         "label_autosuggest": [
#                     #             "bacterium <b>RS32G</b>"
#                     #         ]
#                     #     }
#                     # }
#                 }
#             }
#         }
#         response_json['responseHeader']['response']['numFound'] = num_found
#
#         highlighting = {}
#         for each_result in results:
#             each_result_formated = {}
#
#             id = each_result['data']['variable']['so:name']
#             each_result_formated['id'] = id
#             each_result_formated['iri'] = "http://www.cropontology.org/terms/" + each_result['data']['variable']['so:sameAs']
#             each_result_formated['short_form'] = id
#             each_result_formated['obo_id'] = ""
#             each_result_formated['label'] = each_result['data']['trait']['so:name']
#             each_result_formated['ontology_name'] = each_result['data']['variable']['so:sameAs']
#             each_result_formated['ontology_prefix'] = "co"
#             each_result_formated['type'] = each_result['data']['@type']
#
#             docs_results.append(each_result_formated)
#
#             highlighting[id] = {
#                 "label_autosuggest": [
#                     # f"{string}"
#                     "{}".format(string)
#                 ]
#             }
#
#         response_json['responseHeader']['response']['docs'] = docs_results
#         response_json['responseHeader']['response']['highlighting'] = highlighting
#         return json.dumps(response_json)
#     else:
#         return "[]"
