from django.shortcuts import render
import json

# Create your views here.

from django.http import HttpResponse
from .grassroots_requests import get_all_services


def index(request):
    return render(request, 'index.html', {})

def index_ajax(request):
    service_list_json = get_all_services()
    return HttpResponse(service_list_json)

def single_service(request):
    return render(request, 'service.html', {})