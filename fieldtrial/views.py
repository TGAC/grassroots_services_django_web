from django.shortcuts import render
import json

# Create your views here.

from django.http import HttpResponse
from .grassroots_fieldtrial_requests import get_all_fieldtrials
from .grassroots_fieldtrial_requests import get_fieldtrial
from .grassroots_fieldtrial_requests import get_study
from .grassroots_fieldtrial_requests import get_plot


def index_loading(request):
    return render(request, 'fieldtrial_loading.html', {})

def index(request):
    return render(request, 'fieldtrial.html', {'data': get_all_fieldtrials, 'type': 'AllFieldTrials'})

def single_fieldtrial(request, fieldtrial_id):
    return render(request, 'fieldtrial.html', {'data': get_fieldtrial(fieldtrial_id), 'type': 'Grassroots:FieldTrial'})

def single_study(request, study_id):
    return render(request, 'study.html', {'data': get_study(study_id), 'type': 'Grassroots:Study'})

def single_plot(request, plot_id):
    plot = get_plot(plot_id)
    plot_json = json.loads(plot)
    study_name = plot_json['results'][0]['results'][0]['data']['so:name']
    return render(request, 'plots.html', {'data': plot, 'plot_id': plot_id, 'study_name': study_name})
