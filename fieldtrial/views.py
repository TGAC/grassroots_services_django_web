from django.shortcuts import render
import json

from django.conf import settings
import numpy as np

from django import template
from plotly.offline import plot
from plotly.graph_objs import Scatter

register = template.Library()


# Create your views here.

from django.http import HttpResponse
from .grassroots_fieldtrial_requests import get_all_fieldtrials
from .grassroots_fieldtrial_requests import get_fieldtrial
from .grassroots_fieldtrial_requests import get_study
from .grassroots_fieldtrial_requests import get_plot
from .grassroots_fieldtrial_requests import search_fieldtrial

from .grassroots_plots import numpy_data
from .grassroots_plots import plotly_plot
from .grassroots_plots import seaborn_plot

'''
Field trial index page request, pre-load the template
'''
def index_loading(request):
    return render(request, 'fieldtrial_loading.html', {})

'''
Field trial index page request, with all field trials
'''
def index(request):
    return render(request, 'fieldtrial.html', {'data': get_all_fieldtrials, 'type': 'AllFieldTrials'})

'''
One Field trial page request
'''
def single_fieldtrial(request, fieldtrial_id):
    return render(request, 'fieldtrial.html', {'data': get_fieldtrial(fieldtrial_id), 'type': 'Grassroots:FieldTrial'})

'''
One study page request
'''
def single_study(request, study_id):
    study = get_study(study_id)
    # data and type goes to the template study.html
    
    result_json = json.loads (study)
    study_json = result_json ['results'][0]['results'][0]['data']

    ##print (json.dumps (study_json))
    #print (settings.BASE_DIR)
    full_path=request.build_absolute_uri()
    
    ft_id         = study_json['parent_field_trial']['_id']['$oid']
    individual_id = study_json['_id']['$oid']
    
    N_t=0
    counters=[]
    flag=False
    ## number of treatment factors
    if  study_json['treatment_factors']:
        #print(len(study_json['treatment_factors']))
        N_t = len(study_json['treatment_factors'])
        value1 = study_json['treatment_factors']
    
        #values per treatment. create array for nested for loop 
        for i in range(N_t):
            ranges=range(len(value1[i]['values']))
            counters.append (ranges)
            flag=True
   
    #print(len(study_json['treatment_factors'])) 

    ### replace 'study' for 'plots' to create the link to the plots in given study ###
    full_path_plots=full_path.replace('study', 'plots')
    
    ### link for field trial name replace indiviual id for id of the field trial ###
    field_trial_link=full_path.replace('study/', '')
    field_trial_link=field_trial_link.replace(individual_id, ft_id)
    
    return render(request, 'study.html', {'data': study, 'study_json': study_json, 'type': 'Grassroots:Study', 'path_plots':full_path_plots, 'ft_path':field_trial_link, 'N_treatments':range(N_t), 'counters':counters, 'flag':flag} )
    #return render(request, 'study.html', {'data': study, 'study_json': study_json, 'type': 'Grassroots:Study', 'BASE_DIR':settings.BASE_DIR})
    #return render(request, 'study.html', {'data': study, 'type': 'Grassroots:Study'})

'''
One study's plots page request
'''
def single_plot(request, plot_id):
    plot = get_plot(plot_id)
    plot_json = json.loads(plot)
    study_name = plot_json['results'][0]['results'][0]['data']['so:name']

    plot_array = plot_json['results'][0]['results'][0]['data']['plots']       # send only array of 'plots' to plotly
    phenotypes = plot_json['results'][0]['results'][0]['data']['phenotypes']  # Details of all the phenotypes
    
    matrices   = numpy_data(plot_array, phenotypes)

    row     = matrices[0]
    column  = matrices[1]
    row_raw = matrices[2]
    row_acc = matrices[3]
    traitName = matrices[4]
    units     = matrices[5]
    plotID    = matrices[6]

    plotIDs      =  plotID.reshape(row,column)
    accession    = row_acc.reshape(row,column)
    plotlyMatrix = row_raw.reshape(row,column)
    static    = row_raw.reshape(row,column)

    plot_div = plotly_plot(plotlyMatrix, accession, traitName, units, plotIDs)
    image    = seaborn_plot(static,   traitName,  units)
    
    return render(request, 'plots.html', {'data': plot, 'plot_id': plot_id, 'study_name': study_name, 
        'plot_div': plot_div, 'heatmap':image})

'''
Search field trial page request
'''
def search_fieldtrial(request):
    data = request.POST.get('search_str', False)
    response_json = search_fieldtrial(data)
    return HttpResponse(response_json)


