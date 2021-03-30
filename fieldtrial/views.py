from django.shortcuts import render
import json

# Create your views here.

from django.http import HttpResponse
from .grassroots_fieldtrial_requests import get_all_fieldtrials
from .grassroots_fieldtrial_requests import get_fieldtrial
from .grassroots_fieldtrial_requests import get_study
# from .grassroots_fieldtrial_requests import get_plot


def index_loading(request):
    return render(request, 'fieldtrial_dynamic_loading.html', {})

def index(request):
    return render(request, 'fieldtrial_dynamic.html', {'data': get_all_fieldtrials, 'type': 'AllFieldTrials'})

def single_fieldtrial(request, fieldtrial_id):
    return render(request, 'fieldtrial_dynamic.html', {'data': get_fieldtrial(fieldtrial_id), 'type': 'Grassroots:FieldTrial'})

def single_study(request, study_id):
    return render(request, 'fieldtrial_dynamic.html', {'data': get_study(study_id), 'type': 'Grassroots:Study'})

# def single_plot(request, plot_id):
#     return render(request, 'fieldplot_dynamic.html', {'data': get_plot(plot_id)})
