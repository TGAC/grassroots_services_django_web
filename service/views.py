from django.shortcuts import render
import json

# Create your views here.

from django.http import HttpResponse
from .grassroots_requests import get_all_services
from .grassroots_requests import get_service
# from .grassroots_requests import search_treatment
# from .grassroots_requests import submit_form
# from .grassroots_requests import check_result
from .grassroots_requests import search_treatment_return_ols
from .grassroots_requests import interact_backend

'''
index page
'''
def index(request):
    return render(request, 'index.html', {})

'''
Get all services as a json array
'''
def index_ajax(request):
    service_list_json = get_all_services()
    return HttpResponse(service_list_json)

'''
Get one named service
'''
def single_service(request, service_alt_name):
    return render(request, 'service.html', {'service_alt_name': service_alt_name})

'''
Get one named service with payload
'''
def single_service_with_payload(request, payload):
    return render(request, 'service_payload.html', {'payload': payload})

'''
Get search grassroots service with a query
'''
def single_service_search_q(request, search_q):
    return render(request, 'service_search_q.html', {'q': search_q})

def single_service_ajax(request):
    service_name = request.POST['service_name']
    service_json = get_service(service_name)
    return HttpResponse(service_json)

'''
Post request from front-end to the backend
'''
def interact_with_apache(request):
    data = request.body
    response_json = interact_backend(data)
    return HttpResponse(response_json)


# def search_treatment_ajax(request):
#     data = request.POST['data']
#     response_json = search_treatment(data)
#     return HttpResponse(response_json)
#
#
# def submit_form_ajax(request):
#     data = request.POST['data']
#     response_json = submit_form(json.loads(data))
#     return HttpResponse(response_json)
#
#
# def check_result_ajax(request):
#     data = request.POST['data']
#     response_json = check_result(json.loads(data))
#     return HttpResponse(response_json)

'''
GET request for ontology look up service for COPO
'''
def crop_ontology_search(request):
    search_string = request.GET['q']
    response_json = search_treatment_return_ols(search_string)
    return HttpResponse(response_json, content_type='application/json')
