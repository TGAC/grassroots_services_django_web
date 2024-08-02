from django.shortcuts import render
import json
import os

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
from .grassroots_plots import treatments
from .grassroots_plots import dict_phenotypes

from .grassroots_csv import create_CSV

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
    #return render(request, 'fieldtrial/fieldtrial.html', {'data': get_all_fieldtrials, 'type': 'AllFieldTrials'})

'''
One Field trial page request
'''
def single_fieldtrial(request, fieldtrial_id):
    return render(request, 'fieldtrial.html', {'data': get_fieldtrial(fieldtrial_id), 'type': 'Grassroots:FieldTrial'})

'''
One study page request
'''
def single_study(request, study_id):
    base_url="https://grassroots.tools"
    study = get_study(study_id)
    result_json = json.loads (study)
    study_json = result_json ['results'][0]['results'][0]['data']
    
    if  "phenotypes" in study_json: 
        phenotypes = result_json['results'][0]['results'][0]['data']['phenotypes']  # for CSV file
    if  'plots' in study_json: 
        plot_array = result_json['results'][0]['results'][0]['data']['plots']       # for CSV 
    if  'treatment_factors' in study_json:
        treatment_factors = result_json['results'][0]['results'][0]['data']['treatment_factors'] # for CSV

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
   
    ## create CSV file /filedownload/Files for link grassroots.tools/download/ID 
    if  "phenotypes" in study_json: 
        create_CSV(plot_array, phenotypes, treatment_factors, study_id)

    ### replace 'study' for 'plots' to create the link to the plots in given study ###
    full_path_plots=full_path.replace('study', 'plots')
    full_path_plots=full_path_plots.replace("http://127.0.0.1:8000", base_url)
    
    ### link for field trial name replace indiviual id for id of the field trial ###
    field_trial_link=full_path.replace('study/', '')
    field_trial_link=field_trial_link.replace(individual_id, ft_id)
    field_trial_link=field_trial_link.replace("http://127.0.0.1:8000", base_url)

    ## FIND IMAGES FOR CAROUSEL 
    #############local_base_path = "/home/daniel/Applications/apache/htdocs/TEST"
    local_base_path = "/opt/apache/htdocs/field_trial_data/APItest"  # location in BETA SERVER
    ###web_base_url = "http://127.0.0.1:2000/TEST"  # Web-accessible base URL
    ## https://grassroots.tools/beta/field_trial_data/APItest/
    ## USE ALIAS IN APACHE TO POINT TO /opt/apache/htdocs/field_trial_data/APItest
    web_base_url="https://grassroots.tools/beta/media"
    
    imageUrls = []

    for plot in plot_array:
        if plot.get('rows') and plot['rows'][0].get('study_index'):
            study_index = plot['rows'][0]['study_index']  # Extract study_index from the first row
            #print(study_index)
            plot_dir = f"{local_base_path}/{study_id}/plot_{study_index}"
            web_plot_dir = f"{web_base_url}/{study_id}/plot_{study_index}"            
            plot_images = list_image_files(web_plot_dir, plot_dir)
            imageUrls.extend(plot_images)
    
    #imageUrls = [
    #    'http://127.0.0.1:2000/TEST/64b6449ad6500621c01c65e2/plot_1/photo_plot_1_2024_02_09.jpg',
    #    'http://127.0.0.1:2000/TEST/64b6449ad6500621c01c65e2/plot_2/photo_plot_2_2024_02_14.jpg'
    #]
    #imageUrls = [
    #    'https://grassroots.tools/beta/field_trial_data/APItest/64f1e4e77c486e019b4e3017/photo_plot_1_2024_02_09.jpg',
    #    'https://grassroots.tools/beta/field_trial_data/APItest/64f1e4e77c486e019b4e3017/photo_plot_1_2024_02_13.jpg',
    #    'https://grassroots.tools/beta/field_trial_data/APItest/64f1e4e77c486e019b4e3017/photo_plot_2_2024_02_09.jpg',
    #]
    ##imageUrls = []

    #return render(request, 'study.html', {'data': study, 'study_json': study_json, 'type': 'Grassroots:Study', 'path_plots':full_path_plots, 'ft_path':field_trial_link, 'N_treatments':range(N_t), 'counters':counters, 'flag':flag} )
    return render(request, 'fieldtrial/study.html', {'data': study, 
                                                     'study_json': study_json, 
                                                     'type': 'Grassroots:Study', 
                                                     'path_plots':full_path_plots, 
                                                     'ft_path':field_trial_link, 
                                                     'N_treatments':range(N_t), 
                                                     'counters':counters, 
                                                     'flag':flag, 
                                                     'imageUrls':imageUrls } )
def list_image_files(base_url, directory_path):
    """
    Generate web-accessible URLs for image files in a specified directory.
    """
    image_files = []
    supported_extensions = ['.jpg', '.jpeg', '.png']
    try:
        # List all files in the directory
        for item in os.listdir(directory_path):
            # Check if the file is an image
            if any(item.endswith(ext) for ext in supported_extensions):
                # Construct web-accessible URL
                image_url = f"{base_url}/{item}"
                image_files.append(image_url)
    except FileNotFoundError:
        print("Directory not found:", directory_path)

    return image_files

    
'''
One study's plots page request
'''
def single_plot(request, plot_id):
    plot = get_plot(plot_id)
    plot_json = json.loads(plot)
    study_name = plot_json['results'][0]['results'][0]['data']['so:name']
    study_data = plot_json ['results'][0]['results'][0]['data']

    plot_array = plot_json['results'][0]['results'][0]['data']['plots']     
    treatment_factors = plot_json['results'][0]['results'][0]['data']['treatment_factors']

    total_rows    = plot_json['results'][0]['results'][0]['data']['num_rows']
    total_columns = plot_json['results'][0]['results'][0]['data']['num_columns']


    if  'phenotypes' in study_data:
        phenotypes = plot_json['results'][0]['results'][0]['data']['phenotypes']  #
        dictTraits = dict_phenotypes(phenotypes, plot_array)  # dictionary to fill dropdown menu
        default_name = list(dictTraits.keys())[0]             # select first phenotype as default
    else:
        dictTraits = {'No Data':'No data'}  #
        phenotypes = {'No Data': 'No Data'}
        default_name = list(dictTraits.keys())[0]       

   
    print("Default phenotype: ", default_name )

    if 'singlePhenotype' in request.GET:
        selected_phenotype = request.GET['singlePhenotype']
    else:
        selected_phenotype = default_name

    matrices   = numpy_data(plot_array, phenotypes, selected_phenotype, total_rows, total_columns)

    row     = matrices[0]
    column  = matrices[1]
    row_raw = matrices[2]
    row_acc = matrices[3]
    traitName = matrices[4]
    units     = matrices[5]
    plotID    = matrices[6]

    plotIDs      =  plotID.reshape(row,column)
    accession    = row_acc.reshape(row,column)
    #plotlyMatrix = row_raw.reshape(row,column) #reshape in plotly_div()
    static    = row_raw.reshape(row,column)
    
    treatment=[]
    if ( len(treatment_factors)>0):
          treatment = treatments(plot_array, row, column)

    create_CSV(plot_array, phenotypes, treatment_factors, plot_id)
    plot_div = plotly_plot(row_raw, accession, traitName, units, plotIDs, treatment)
    #image    = seaborn_plot(static,   traitName,  units)
    
    data = plot
    imageUrls = []
    ## FIND IMAGES FOR CAROUSEL 
    #####local_base_path = "/home/daniel/Applications/apache/htdocs/TEST"
    local_base_path = "/opt/apache/htdocs/field_trial_data/APItest"  # location in BETA SERVER
    #########web_base_url = "http://127.0.0.1:2000/TEST"  # Web-accessible base URL
    ## https://grassroots.tools/beta/field_trial_data/APItest/
    ## USE ALIAS IN APACHE TO POINT TO /opt/apache/htdocs/field_trial_data/APItest
    web_base_url="https://grassroots.tools/beta/media"
    for plot in plot_array:
        if plot.get('rows') and plot['rows'][0].get('study_index'):
            study_index = plot['rows'][0]['study_index']  # Extract study_index from the first row
            #print(study_index)
            plot_dir = f"{local_base_path}/{plot_id}/plot_{study_index}"
            web_plot_dir = f"{web_base_url}/{plot_id}/plot_{study_index}"            
            plot_images = list_image_files(web_plot_dir, plot_dir)
            imageUrls.extend(plot_images)
    #print("Image URLs: ", imageUrls)

    return render(request, 'plots.html', {'data': data, 'plot_id': plot_id, 'study_name': study_name, 
        'plot_div': plot_div, 'dictTraits':dictTraits, 'imageUrls':imageUrls})
    #return render(request, 'fieldtrial/plot.html', {'data': plot, 'plot_id': plot_id, 'study_name': study_name, 
    #    'plot_div': plot_div, 'dictTraits':dictTraits})

'''
Search field trial page request
'''
def search_fieldtrial(request):
    data = request.POST.get('search_str', False)
    response_json = search_fieldtrial(data)
    return HttpResponse(response_json)


