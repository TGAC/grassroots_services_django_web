from django.shortcuts import render
import json

# Create your views here.

from django.http import HttpResponse
from .grassroots_requests import get_all_services
from .grassroots_requests import get_service
from .grassroots_requests import search_treatment


def index(request):
    return render(request, 'index.html', {})


def index_ajax(request):
    service_list_json = get_all_services()
    return HttpResponse(service_list_json)


def single_service(request, service_name):
    return render(request, 'service.html', {'service_name': service_name})


def single_service_ajax(request):
    service_name = request.POST['service_name']
    service_json = get_service(service_name)
    return HttpResponse(service_json)

def search_treatment_ajax(request):
    data = request.POST['data']
    response_json = search_treatment(data)
    return HttpResponse(response_json)

