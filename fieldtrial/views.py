from django.shortcuts import render
import json

# Create your views here.

from django.http import HttpResponse
from .grassroots_fieldtrial_requests import get_all_fieldtrials
from .grassroots_fieldtrial_requests import get_fieldtrial
from .grassroots_fieldtrial_requests import get_study
from .grassroots_fieldtrial_requests import get_plot
from .grassroots_fieldtrial_requests import search_fieldtrial


def index_loading(request):
    return render(request, 'fieldtrial_loading.html', {})

def index(request):
    return render(request, 'fieldtrial.html', {'data': get_all_fieldtrials, 'type': 'AllFieldTrials'})

def single_fieldtrial(request, fieldtrial_id):
    return render(request, 'fieldtrial.html', {'data': get_fieldtrial(fieldtrial_id), 'type': 'Grassroots:FieldTrial'})

def single_study(request, study_id):
    study = get_study(study_id)
    # la = study[0]['address']['address']['location']['centre']['latitude']
    # lo = study[0]['address']['address']['location']['centre']['longitude']
    return render(request, 'study.html', {'data': study, 'type': 'Grassroots:Study'})

def single_plot(request, plot_id):
    plot = get_plot(plot_id)
    plot_json = json.loads(plot)
    study_name = plot_json['results'][0]['results'][0]['data']['so:name']
    return render(request, 'plots.html', {'data': plot, 'plot_id': plot_id, 'study_name': study_name})

def search_fieldtrial(request):
    data = request.POST.get('search_str', False)
    response_json = search_fieldtrial(data)
    return HttpResponse(response_json)
