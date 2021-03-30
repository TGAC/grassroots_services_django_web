from django.shortcuts import render
import json

# Create your views here.

from django.http import HttpResponse
from .grassroots_fieldtrial_requests import get_all_fieldtrials
from .grassroots_fieldtrial_requests import get_fieldtrial
# from .grassroots_requests import get_service
# from .grassroots_requests import search_treatment
# from .grassroots_requests import submit_form
# from .grassroots_requests import check_result
# from .grassroots_requests import search_treatment_return_ols


def index(request):
    return render(request, 'fieldtrial_dynamic.html', {'data': get_all_fieldtrials, 'type': 'AllFieldTrials'})

#
# def index_ajax(request):
#     service_list_json = get_all_services()
#     return HttpResponse(service_list_json)


def single_fieldtrial(request, fieldtrial_id):
    return render(request, 'fieldtrial_dynamic.html', {'data': get_fieldtrial(fieldtrial_id), 'type': 'Grassroots:FieldTrial'})
#
#
# def single_service_ajax(request):
#     service_name = request.POST['service_name']
#     service_json = get_service(service_name)
#     return HttpResponse(service_json)
#
#
# def interact_with_apache(request):
#     data = request.POST['data']
#     response_json = interact_backend(data)
#     return HttpResponse(response_json)
#
#
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
#
#
# def crop_ontology_search(request):
#     search_string = request.GET['q']
#     response_json = search_treatment_return_ols(search_string)
#     return HttpResponse(response_json, content_type='application/json')
