import requests
import json

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64

from plotly.offline import plot
from plotly.graph_objs import Scatter
import plotly.express as px
import plotly.figure_factory as ff

from functools import reduce


############################################################################################
'''
test rendering plotly interactive heatmap
'''

def plotly_plot(numpy_matrix, accession):
   
    numpy_matrix = np.flipud(numpy_matrix)      # To Match order shown originally in JS code
    accession    = np.flipud(accession)            # To Match order shown originally in JS code

    notAvailable = np.zeros_like(numpy_matrix)
    discarded    =  np.zeros_like(numpy_matrix)
    indexInf     =  np.where(np.isinf(numpy_matrix))
    indexDiscard =  np.where(np.isnan(numpy_matrix))
    notAvailable[indexInf]   = 1
    discarded[indexDiscard]  = 1
    NA        = np.where(notAvailable < 1, np.nan, notAvailable)
    discarded = np.where(   discarded < 1, np.nan, discarded)

    numpy_matrix[indexInf] = np.nan # Replace Inf by NaN

    # Reverse Y ticks and start them from 1
    size=numpy_matrix.shape
    Y = size[0]
    Yvals = np.arange(0,Y)
    Yaxis = np.arange(1,Y+1)
    Yaxis = np.flip(Yaxis)

    fig = px.imshow(numpy_matrix, aspect="auto",
            labels=dict(x="columns", y="rows", color="Value"),
            color_continuous_scale=px.colors.sequential.Greens )

    fig.update_traces(
        customdata = np.moveaxis([accession, numpy_matrix], 0,-1),
        hovertemplate="Accession: %{customdata[0]}<br>raw value: %{customdata[1]:.2f}  <extra></extra>")

    fig.update_layout( font=dict(family="Courier New, monospace",size=12,color="Black"),title={
        'text': "Raw Values of Grain Yield...",
        'y':0.98,'x':0.5,
        'xanchor': 'center','yanchor': 'top'})

    fig.update_layout( yaxis = dict(tickmode = 'array', tickvals = Yvals, ticktext = Yaxis ) )


    fig.update_xaxes(showgrid=True, gridwidth=7, gridcolor='Black', zeroline=False)
    fig.update_yaxes(showgrid=True, gridwidth=7, gridcolor='Black', zeroline=False)
    
    fig['layout'].update(plot_bgcolor='black')

    plot_div = plot(fig, output_type='div')

    return plot_div

############################################################################################
'''
test rendering seaborn image
'''
def seaborn_plot(numpy_matrix):

    sns.set(rc={'figure.figsize':(22.7,8.27)})
    
    #print(numpy_matrix.shape)
    notAvailable = np.zeros_like(numpy_matrix)
    discarded    =  np.zeros_like(numpy_matrix)
    indexInf     =  np.where(np.isinf(numpy_matrix))
    indexDiscard =  np.where(np.isnan(numpy_matrix))
    notAvailable[indexInf]   = 1
    discarded[indexDiscard]  = 1
    NA        = np.where(notAvailable < 1, np.nan, notAvailable)
    discarded = np.where(   discarded < 1, np.nan, discarded)

    numpy_matrix[indexInf] = np.nan # Replace Inf by NaN

    # Reverse Y ticks and start them from 1
    size = numpy_matrix.shape
    Y    = size[0]
    Yaxis = np.arange(1,Y+1)
    Yaxis = np.flip(Yaxis)

    maxVal = np.nanmax(numpy_matrix)
    minVal = np.nanmin(numpy_matrix)
    #print(minVal)
    colormap  = sns.light_palette("seagreen", as_cmap=True)
    dark      = sns.dark_palette((260, 75, 60), input="husl")
    sns.heatmap(NA, linewidth=0.5,cmap=dark, cbar=False )

    g = sns.heatmap(numpy_matrix,  vmax=maxVal, vmin=minVal,linewidth=0.5,cmap=colormap, cbar_kws={'label': 'unit: t/ha'}) 
    ##g.set_facecolor('xkcd:black')

    g.patch.set_facecolor('white')
    g.patch.set_edgecolor('black')
    g.patch.set_hatch('xx')


    g.set_xlabel("Columns", fontsize = 14)
    g.set_ylabel("Rows", fontsize = 14)
    g.set_title("Raw Values of Grain Yield @ 85% Dry Matter", fontsize = 20)
    g.set_yticklabels(Yaxis)
    g.tick_params(axis='y', rotation=0)
   

    fig = g.get_figure()
    mem = BytesIO()
    fig.savefig(mem, format='png')
    fig.savefig('heatnew.png')
    fig.clf()
    mem.seek(0)
    image = base64.b64encode(mem.getvalue()) # load the bytes in context as base64
    image = image.decode('utf8')
    mem.close()
     
    return image
 

'''
Create numpy arrays for plotly script. Matrix of raw values and matrix of accession 
'''
def numpy_data(json):
    test=json[0]['rows'][0]['study_index']

    current_name =  json[3]['rows'][0]['observations'][0]['phenotype']['variable'] # SELECT RANDOM PHENOTYPE FOR TESTS 
  
    row_raw   = np.array([])
    matrix    = np.array([])
    row_acc   = np.array([])
    accession = np.array([])

    matrices = []
    


    row    = 1
    column = 1
    #loop throght observations like in JS code. Add extra array to store accession as well.
    for j in range(len(json)):
        if ( int( json[j]['row_index'] ) == row ):
            if  (int( json[j]['column_index'] ) == column):   
               if   ( 'discard' in json[j]['rows'][0] ):
                    
                    row_raw = np.append(row_raw, np.nan )  # use NaN for discarded plots
                    row_acc = np.append(row_acc, np.nan )  
               
               elif ( 'observations' in json[j]['rows'][0] ):
                    if( search_phenotype(json[j]['rows'][0]['observations'], current_name) ):
                        row_raw = np.append(row_raw, json[j]['rows'][0]['observations'][0]['raw_value']) 
                        row_acc = np.append(row_acc, json[j]['rows'][0]['material']['accession']) 
                    else:
                        row_raw = np.append(row_raw, np.inf )  # use infinity for N/A data
                        row_acc = np.append(row_acc, np.nan )  
  
               column+=1

        elif ( int( json[j]['row_index'] ) > row  ):
            if   ( 'discard' in json[j]['rows'][0] ):
                    row_raw = np.append(row_raw, np.nan )  
                    row_acc = np.append(row_acc, np.nan )  
            elif ( 'observations' in json[j]['rows'][0] ):
                    if( search_phenotype(json[j]['rows'][0]['observations'], current_name) ):
                        row_raw = np.append(row_raw, json[j]['rows'][0]['observations'][0]['raw_value'])  
                        row_acc = np.append(row_acc, json[j]['rows'][0]['material']['accession']) 
                    else:
                        row_raw = np.append(row_raw, np.inf )
                        row_acc = np.append(row_acc, np.nan )  

            row+=1
            column=2


    #accession = row_acc.reshape(row,column-1)   
    #matrix = row_raw.reshape(row,column-1)   
    #print("matrix", matrix.shape)
 
    print("phenotype-", current_name )

    matrices.append(row)
    matrices.append(column)
    matrices.append(row_raw)
    matrices.append(row_acc)
    
    return matrices


def lookup_keys(dictionary, keys, default=None):
     return reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)

def search_phenotype(list_observations, value):  
    
    for i in range(len(list_observations)):
        
        dic            = list_observations[i]
        phenotype_name = lookup_keys(dic, 'phenotype.variable')
        if  (phenotype_name == value ):
              return True
              
        else:
              return False



