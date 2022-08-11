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

################################################################################################################
def search_phenotype(list_observations, value):  
    
    for i in range(len(list_observations)):
        
        dic            = list_observations[i]
        phenotype_name = lookup_keys(dic, 'phenotype.variable')
        if  (phenotype_name == value ):
              return True
              
        else:
              return False

###################################################################
def searchPhenotypeTrait(listPheno, value):

    name = listPheno[value]['definition']['trait']['so:name']

    return name

###################################################################
def searchPhenotypeUnit(listPheno, value):

    name = listPheno[value]['definition']['unit']['so:name']

    return name



############################################################################################
'''
test rendering plotly interactive heatmap
'''

def plotly_plot(matrix, accession, title, unit):
   
    main_matrix = np.flipud(matrix)      # To Match order shown originally in JS code
    accession   = np.flipud(accession)            # To Match order shown originally in JS code
    size = main_matrix.shape
    Y =   size[0]
    X =   size[1]

    notAvailable = np.zeros_like(main_matrix)
    discarded    =  np.zeros_like(main_matrix)
    indexInf     =  np.where(np.isinf(main_matrix))
    indexDiscard =  np.where(np.isnan(main_matrix))
    notAvailable[indexInf]   = 1
    discarded[indexDiscard]  = 1
    NA        = np.where(notAvailable < 1, np.nan, notAvailable)
    discarded = np.where(   discarded < 1, np.nan, discarded)

    #print(indexInf)
    main_matrix[indexInf] = np.nan # Replace Inf by NaN

    numpy_array = main_matrix.flatten()
    strings     = np.array(["%.3f" % x for x in numpy_array])  #matrix has to be flattened for conversion to strings
    s_matrix    = strings.reshape(Y,X)                         #new matrix used in hovering text to show raw values.
    s_matrix[indexInf]     = 'N/A'
    s_matrix[indexDiscard] = 'N/A'

    accession[indexDiscard] = 'Discarded'
    accession[indexInf]     = 'N/A'

    units = 'Units: '+unit
    # Reverse Y ticks and start them from 1
    size = main_matrix.shape
    Yvals = np.arange(0,Y)
    Yaxis = np.arange(1,Y+1)
    Yaxis = np.flip(Yaxis)

    Xvals = np.arange(0, X)
    Xaxis = np.arange(1,X+1)

    fig = px.imshow(main_matrix, aspect="auto",
            labels=dict(x="columns", y="rows", color=units),
            color_continuous_scale=px.colors.sequential.Greens )

    fig.update_traces(
        customdata = np.moveaxis([accession, s_matrix], 0,-1),
        #hovertemplate="Accession: %{customdata[0]}<br>raw value: %{customdata[1]:.2f}  <extra></extra>")
        hovertemplate="Accession: %{customdata[0]}<br>raw value: %{customdata[1]}  <extra></extra>")

    fig.update_layout( font=dict(family="Courier New, monospace",size=12,color="Black"),title={
        'text': title,
        'y':0.98,'x':0.5,
        'xanchor': 'center','yanchor': 'top'})

    fig.update_layout( yaxis = dict(tickmode = 'array', tickvals = Yvals, ticktext = Yaxis ) )
    fig.update_layout( xaxis = dict(tickmode = 'array', tickvals = Xvals, ticktext = Xaxis ) )


    fig.update_xaxes(showgrid=True, gridwidth=7, gridcolor='Black', zeroline=False)
    fig.update_yaxes(showgrid=True, gridwidth=7, gridcolor='Black', zeroline=False)
    
    fig['layout'].update(plot_bgcolor='black')

    plot_div = plot(fig, output_type='div')

    main_matrix[indexInf] = np.inf

    return plot_div

############################################################################################
'''
test rendering seaborn image
'''
def seaborn_plot(numpy_matrix, title, unit):

    sns.set(rc={'figure.figsize':(17.5,8.0)})

    numpy_matrix = np.flipud(numpy_matrix)      # To Match order shown originally in JS code
    #print(numpy_matrix.shape)
    notAvailable = np.zeros_like(numpy_matrix)
    discarded    =  np.zeros_like(numpy_matrix)
    indexInf     =  np.where(np.isinf(numpy_matrix))
    indexDiscard =  np.where(np.isnan(numpy_matrix))
    notAvailable[indexInf]   = 1
    discarded[indexDiscard]  = 1
    NA        = np.where(notAvailable < 1, np.nan, notAvailable)
    discarded = np.where(   discarded < 1, np.nan, discarded)
    units = 'Units: '+ unit

    numpy_matrix[indexInf] = np.nan # Replace Inf by NaN

    # Reverse Y ticks and start them from 1
    size  = numpy_matrix.shape
    Y     = size[0]
    Yvals = np.arange(0.5, Y+0.5, 1.0)
    Yaxis = np.arange(1,Y+1)
    Yaxis = np.flip(Yaxis)

    X     = size[1]
    Xvals = np.arange(0, X)
    Xaxis = np.arange(1,X+1)


    maxVal = np.nanmax(numpy_matrix)
    minVal = np.nanmin(numpy_matrix)
    #print(minVal)
    colormap  = sns.light_palette("seagreen", as_cmap=True)
    dark      = sns.dark_palette((260, 75, 60), input="husl")
    sns.heatmap(NA, linewidth=0.5,cmap=dark, cbar=False )

    g = sns.heatmap(numpy_matrix,  vmax=maxVal, vmin=minVal,linewidth=0.5,cmap=colormap, cbar_kws={'label': units}) 
    ##g.set_facecolor('xkcd:black')

    g.patch.set_facecolor('white')
    g.patch.set_edgecolor('black')
    g.patch.set_hatch('xx')


    g.set_xlabel("Columns", fontsize = 14)
    g.set_ylabel("Rows", fontsize = 14)
    g.set_title(title, fontsize = 20)
    g.set_yticks( Yvals )
    g.set_yticklabels(Yaxis, size=10)
    g.tick_params(    axis='y', rotation=0)
    g.set_xticks(Xvals)
    g.set_xticklabels(Xaxis, size=10)
   

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
def numpy_data(json, pheno):
    test=json[0]['rows'][0]['study_index']

    current_name =  json[3]['rows'][0]['observations'][0]['phenotype']['variable'] # SELECT RANDOM PHENOTYPE FOR TESTS 
    traitName = searchPhenotypeTrait(pheno, current_name)
    unit      = searchPhenotypeUnit( pheno, current_name)

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
               columns = json[j]['column_index']#

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
            columns = json[j]['column_index']


    column = columns # use actual number of columns instead of counter
    
    #print("number of plots and shape check", len(json), row, column, row*(column) )
    if (len(json) != row*column):
        print("NOT rectangular")
        # fit odd shape plot into bigger rectangular plot.
        row_raw  = oddShapeValues(   json, row, column, current_name)
        row_acc  = oddShapeAccession(json, row, column, current_name)

    matrices.append(row)
    matrices.append(column)
    matrices.append(row_raw)
    matrices.append(row_acc)
    matrices.append(traitName)
    matrices.append(unit)
    
    print("phenotype-", current_name )
    return matrices

################################################################################################################################
def lookup_keys(dictionary, keys, default=None):
     return reduce(lambda d, key: d.get(key, default) if isinstance(d, dict) else default, keys.split("."), dictionary)

#############################################################################################################################
def oddShapeValues(arraysJson, rows, columns, phenotype):

    matrix = np.zeros((rows,columns))
    matrix[:] = np.nan

    for r in range(len(arraysJson)):
        if  ( 'discard' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            matrix[i][j] = np.nan

        elif ( 'observations' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            if( search_phenotype(arraysJson[r]['rows'][0]['observations'], phenotype) ):
                matrix[i][j] = arraysJson[r]['rows'][0]['observations'][0]['raw_value']
            else:
                matrix[i][j] = np.inf

    #matrix = np.flipud(matrix)
    #print(matrix)
    matrix  = matrix.flatten()

    return matrix
#######################################################################
def oddShapeAccession(arraysJson, rows, columns, phenotype):

    dt= np.dtype(('U', 50)) # define string type for of strings (accession names)
    matrix = np.empty((rows,columns), dtype=dt)
    matrix[:] = 'Discarded' #  hovering text in empty plots

    for r in range(len(arraysJson)):
        if  ( 'discard' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            matrix[i][j] = np.nan         #discarded plot

        elif ( 'observations' in arraysJson[r]['rows'][0] ):
            i = int( arraysJson[r]['row_index']    )
            j = int( arraysJson[r]['column_index'] )
            i=i-1
            j=j-1
            if( search_phenotype(arraysJson[r]['rows'][0]['observations'], phenotype) ):
                matrix[i][j] = arraysJson[r]['rows'][0]['material']['accession']
            else:
                matrix[i][j] = np.nan    # No values for that phenotype

    matrix  = matrix.flatten()

    return matrix




