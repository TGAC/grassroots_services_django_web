from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse
from .grassroots_requests import get_all_services


def index(request):
    service_list_json = get_all_services()
    # return HttpResponse("Hello, world. You're at the polls index.")
    return render(request, 'index.html', {'service_list': service_list_json})

# def detail(request, service_name):
#     return HttpResponse("You're looking at question %s." % service_name)