import csv
import os

#############################################################################
def getRowCsv(row_json):

    # Get mandatory values
    plotID = row_json['rows'][0]['study_index']
    row    = row_json['row_index']
    column = row_json['column_index']
    rack = ''
    harvest_date = ''
    sowing_date  = ''

    if  ( 'discard' in row_json['rows'][0] ):
        accession = "Discarded"
    if  ( 'blank' in row_json['rows'][0] ):
        accession = ''
    if  ( 'material' in row_json['rows'][0] ):
        accession = row_json['rows'][0]['material']['accession']
        rack      = row_json['rows'][0]['rack_index']


    # Get rest of phenotype raw values
    variables = []  # header names
    raw_value = []
    if  ( 'observations' in row_json['rows'][0] ):
        observations = row_json['rows'][0]['observations']
        for i in range(len(observations)):
            if  ( 'corrected_value' in observations[i] ):
                variables.append(observations[i]['phenotype']['variable'])  # correction!!
                raw_value.append(observations[i]['corrected_value'])
            elif ( 'raw_value' in observations[i] ):
                variables.append(observations[i]['phenotype']['variable'])
                raw_value.append(observations[i]['raw_value'])


    if  ( 'treatments' in row_json['rows'][0] ):
        treatments = row_json['rows'][0]['treatments']
        for i in range(len(treatments)):
            variables.append(treatments[i]['so:sameAs'])
            raw_value.append(treatments[i]['label'])



    #mandatory headears and values
    headers   = ['Plot ID', 'Row', 'Column', 'Accession']
    mandatory = [plotID, row, column, accession]

    # addional headers
    if  ( 'harvest_date' in row_json ):
        harvest_date = row_json['harvest_date']
    if  ( 'sowing_date' in row_json ):
        sowing_date  = row_json['sowing_date']
    width        = row_json['width']
    length       = row_json['length']

    extra_headers  = ['width','length','Rack','Sowing date', 'Harvest date']
    extra          = [width, length, rack, sowing_date, harvest_date]


    #walking_order = row_json['walking_order']
    #if walking_order is None:


    ##variables[:0] = headers
    variables.extend(headers)
    variables.extend(extra_headers)
    raw_value.extend(mandatory)
    raw_value.extend(extra)

    dict_row = dict(zip(variables, raw_value))
    return dict_row

############################################################################
############################################################################
'''
Create CSV file from JSON study data
'''
def create_CSV(plot_data, phenotypes, treatment_factors, plot_id):
    array_rows  = []
    pheno_names = []
    extra_headers = []

    phenoHeaders = []
    for key in phenotypes:
        phenoHeaders.append(key)

    name = plot_id + '.csv' 
    path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'filedownload/Files'))
    filename = os.path.join(path, name)
    print(filename)

    #mandatory headers
    headers = ['Plot ID', 'Row', 'Column', 'Accession']

    #loop through plot and get each row for csv file
    for r in range(len(plot_data)):
            #j = int( plot_data[r]['column_index'] )
            row_list = getRowCsv(plot_data[r])
            array_rows.append(row_list)

    # if treatments available add them to the headers.
    if len(treatment_factors)>0:
        treatments_csv=[]
        for i in range(len(treatment_factors)):
            treatments_csv.append(treatment_factors[i]['treatment']['so:sameAs'])

        headers.extend(treatments_csv)

    #extra headers
    extra_headers = ['width','length','Rack','Sowing date', 'Harvest date']
    
    headers.extend(extra_headers)
    headers.extend(phenoHeaders)

    with open(filename, 'w', encoding='UTF8', newline='') as f:
        writer = csv.writer(f)
        writer = csv.DictWriter(f, fieldnames = headers)
        writer.writeheader()
        writer.writerows(array_rows)

    f.close()

