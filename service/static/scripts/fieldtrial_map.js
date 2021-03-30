var plotsHTMLArray = {};
var plotsGRUArray = [];
var plot_json = [];
var plotsPhenotypeArray = [];
var global_width = 0;
var global_height = 0;
var colorJSON = {
    1: "#39CCCC",
    2: "#FFDC00",
    3: "#01FF70",
    4: "#FF851B",
    5: "#F012BE",
    6: "#FF4136",
    7: "#3D9970",
    8: "#ABEBC6",
    9: "#2ECC40",
};
var plotsModalInfo = {};
var formatted_treatments = [];

function startFieldTrialGIS(jsonArray, type_param) {
    console.log(JSON.stringify(jsonArray));
    var filtered_data_with_location = [];
    var filtered_data_without_location = [];
    jQuery('#status').html('');
    var fieldTrialName = '';
    var team = '';
    var fieldTrialId = '';
    for (i = 0; i < jsonArray.length; i++) {
        if (type_param === 'Grassroots:FieldTrial') {
            fieldTrialName = jsonArray[i]['data']['so:name'];
            team = jsonArray[i]['data']['team'];
            fieldTrialId = jsonArray[i]['data']['_id']['$oid'];
            if (jsonArray[i]['data']['studies'] != null) {
                for (j = 0; j < jsonArray[i]['data']['studies'].length; j++)
                    if (jsonArray[i]['data']['studies'][j]['address'] != undefined) {
                        if (jsonArray[i]['data']['studies'][j]['address']['address']['location']['centre'] != undefined) {
                            var study_json = jsonArray[i]['data']['studies'][j];
                            // study_json["team"] = team;
                            // study_json["parent_field_trial_name"] = fieldTrialName;
                            // study_json["parent_field_trial_id"] = fieldTrialId;
                            filtered_data_with_location.push(study_json);
                        }
                    } else {
                        var study_json = jsonArray[i]['data']['studies'][j];
                        // study_json["team"] = team;
                        // study_json["so:name"] = fieldTrialName;
                        filtered_data_without_location.push(study_json);
                    }
            } else {
                filtered_data_without_location.push(jsonArray[i]['data']);
            }
        } else if (type_param === 'Grassroots:Study' || type_param === 'AllFieldTrials') {
            // var ft_id = jsonArray[i]['data']['parent_field_trial_id']['$oid'];
            // var req_json = CreatePlotsRequestForFieldTrial(ft_id);

            //
            // if (req_json) {
            //     $.ajax({
            //         type: "POST",
            //         url: server_url,
            //         data: JSON.stringify(req_json),
            //         dataType: "json",
            //         contentType: "application/json; charset=utf-8"
            //     }).done(function (ft_json) {
            //         console.log(ft_json);
            //         fieldTrialName = ft_json['results'][0]['results'][0]['data']['so:name'];
            //         team = ft_json['results'][0]['results'][0]['data']['team'];
            //     }).fail(function (req, status, error) {
            //         console.info("req " + "status " + status + " error " + error);
            //     });
            // }
            //
            var study_json = jsonArray[i]['data'];
            study_json["team"] = '';
            // study_json["so:name"] = fieldTrialName;
            filtered_data_with_location.push(study_json);
        }
    }
    if (type_param === 'Grassroots:FieldTrial') {
        $('#description').append(' ' + fieldTrialName);
    } else if (type_param === 'Grassroots:Study') {
        $('#description').append(' ' + fieldTrialName);
        $('#title').append(' Study');
    }
    produceFieldtrialTable(filtered_data_without_location.concat(filtered_data_with_location), type_param);

    displayFTLocations(filtered_data_with_location, type_param);
    if (type_param !== 'AllFieldTrials') {
        create_study_modal_html(filtered_data_without_location.concat(filtered_data_with_location));
    }
}

function produceFieldtrialTable(data, type_param) {
    // yrtable.destroy();
    yrtable = jQuery('#resultTable').DataTable({
        data: data,
        "ordering": false,
        "columns": [
            {
                title: "Programme",
                "render": function (data, type, full, meta) {
                    let result = '';
                    if (full['parent_program'] !== undefined) {
                        if (full['parent_program']['so:image'] !== undefined) {
                            result = result + ' <img src="' + full['parent_program']['so:image'] + '" height="32px;"/><br/> ';
                        }
                        if (full['parent_program']['so:name'] !== undefined) {
                            result = result + ' ' + SafePrint(full['parent_program']['so:name']) + '<br/>';
                        }
                        if (full['parent_program']['principal_investigator'] !== undefined) {
                            let pi_name = full['parent_program']['principal_investigator']['so:name'];
                            if (full['parent_program']['principal_investigator']['so:email'] !== undefined) {
                                let pi_email = full['parent_program']['principal_investigator']['so:email'];
                                result = result + ' <a href="mailto:' + pi_email + '" target="_blank">' + pi_name + '</a>';
                            } else {
                                result = result + ' ' + SafePrint(pi_name);
                            }
                        }
                    }
                    return result;
                }
            },
            {
                title: "Field Trial",
                "render": function (data, type, full, meta) {
                    var ft_name = SafePrint(full['parent_field_trial']['so:name']);
                    if (full['parent_field_trial'] !== undefined) {
                        var ftId = full['parent_field_trial']['_id']['$oid'];
                        ft_name = '<a href="fieldtrial_dynamic.html?id=' + ftId + '&type=Grassroots:FieldTrial" target="_blank">' + full['parent_field_trial']['so:name'] + '</a>';
                    }
                    return ft_name;
                }
            },
            {
                title: "Study",
                "render": function (data, type, full, meta) {
                    var studyId = full['_id']['$oid'];
                    let study_result = '<a href="fieldtrial_dynamic.html?id=' + studyId + '&type=Grassroots:Study" target="_blank">' + full['so:name'] + '</a>';

                    if (full['curator'] !== undefined) {
                        let curator_name = full['curator']['so:name'];
                        if (full['curator']['so:email'] !== undefined) {
                            let curator_email = full['curator']['so:email'];
                            study_result = study_result + '<br/>Curator: <a href="mailto:' + curator_email + '" target="_blank">' + curator_name + '</a>';
                        } else {
                            study_result = study_result + '<br/>Curator: ' + curator_name;
                        }

                    }
                    if (full['contact'] !== undefined) {
                        let contact_name = full['contact']['so:name'];
                        if (full['contact']['so:email'] !== undefined) {
                            let contact_email = full['contact']['so:email'];
                            study_result = study_result + '<br/>Contact: <a href="mailto:' + contact_email + '" target="_blank">' + contact_name + '</a>';
                        } else {
                            study_result = study_result + '<br/>Contact: ' + contact_name;
                        }
                    }
                    return study_result;
                }
            },
            {
                title: "Team",
                "render": function (data, type, full, meta) {
                    return SafePrint(full['parent_field_trial']['team']);
                }
            },
            // {
            //     title: "Study Design",
            //     "render": function (data, type, full, meta) {
            //         return SafePrint(full['study_design']);
            //     }
            // },
            // {
            //     title: "Phenotype Gathering Notes",
            //     "render": function (data, type, full, meta) {
            //         return SafePrint(full['phenotype_gathering_notes']);
            //     }
            // },
            {
                title: "Description",
                "render": function (data, type, full, meta) {
                    return SafePrint(full['so:description']);
                }
            },
            {
                title: "Sowing Date",
                "render": function (data, type, full, meta) {
                    if (full['sowing_date'] != undefined) {
                        return full['sowing_date'];
                    } else {
                        return '';
                    }
                }
            },
            {
                title: "Harvest Date",
                "render": function (data, type, full, meta) {
                    if (full['harvest_date'] != undefined) {
                        return full['harvest_date'];
                    } else {
                        return '';
                    }
                }
            },
            {
                title: "Plots",
                "render": function (data, type, full, meta) {
                    return get_study_plots_link(full);
                }
            },
            {
                title: "Address",
                "render": function (data, type, full, meta) {
                    return get_study_address(full, true);
                }
            },
            {
                title: "Shape Data",
                "render": function (data, type, full, meta) {
                    if (full['shape_data'] !== null && full['shape_data'] !== undefined && full['shape_data'] !== '') {
                        return '<u class="newstyle_link">View</u>';
                    } else {
                        return '';
                    }
                }
            },
            {
                title: "Treatment Factors",
                "render": function (data, type, full, meta) {
                    var studyId = full['_id']['$oid'];
                    var treatment = '';
                    if (full['treatment_factors'] !== undefined && full['treatment_factors'] !== null && type_param !== 'AllFieldTrials') {
                        if (full['treatment_factors'].length > 0) {
                            treatment = '<span style="cursor:pointer;" class="newstyle_link" onclick="plotModal(\'' + studyId + 'treatment\')">Treatment Factors</span>'
                        }
                    }
                    // return '<ul><li><span style="cursor:pointer;" class="newstyle_link" onclick="plotModal(\'' + studyId + '\')">Study Info</span></li>' + treatment + '</ul>';
                    return treatment;
                }
            }
            // ,
            // {
            //     title: "Links",
            //     "render": function (data, type, full, meta) {
            //         var studyId = full['_id']['$oid'];
            //         var fieldtrial_link = '';
            //         if (full["parent_field_trial_id"] !== undefined) {
            //             fieldtrial_link = '<li><a href="fieldtrial_dynamic.html?id=' + full["parent_field_trial_id"] + '&type=Grassroots:FieldTrial" target="_blank">Field Trial</a></li>'
            //         }
            //         return '<ul><li><a href="fieldtrial_dynamic.html?id=' + studyId + '&type=Grassroots:Study" target="_blank">Study</a></li>' + fieldtrial_link + '</ul>';
            //     }
            // }

        ]

    });

    jQuery('#resultTable tbody').on('click', 'td', function () {
        var cellIdx = yrtable.cell(this).index();
        console.log(cellIdx);
        var rowIdx = cellIdx['row'];
        var json = yrtable.row(rowIdx).data();
        let lalo = [];
        if (json['address'] !== undefined && cellIdx['column'] === 8) {
            if (json['address']['address']['location']['centre'] !== undefined) {
                var la = json['address']['address']['location']['centre']['latitude'];
                var lo = json['address']['address']['location']['centre']['longitude'];
                map.setView([la, lo], 18, {animate: true});
                $(window).scrollTop($('#map').offset().top - 90);

            }
        } else if (json['shape_data'] !== null && json['shape_data'] !== undefined && json['shape_data'] !== '' && cellIdx['column'] === 9) {

            if (json['address']['address']['location']['centre'] !== undefined) {
                var la = json['address']['address']['location']['centre']['latitude'];
                var lo = json['address']['address']['location']['centre']['longitude'];
                lalo = [la, lo];
            }

            let shape_data = JSON.parse(json['shape_data']);
            let coord = shape_data.features[0].geometry.coordinates;
            let zoom = 18;
            if (coord[0][0].length === 2) {
                lalo = coord[0][0][0].reverse();
                zoom = 22;
            } else if (coord[0][0][0].length === 2) {
                lalo = coord[0][0][0].reverse();
                zoom = 22;
            }

            map.setView(lalo, zoom, {animate: true});
            $(window).scrollTop($('#map').offset().top - 90);
        }
    });

    // if (type_param === 'Grassroots:Study'){
    //     yrtable.column( 11 ).visible( false );
    // }

    if (type_param === 'AllFieldTrials') {
        yrtable.column(10).visible(false);
        console.log("server search here");
        jQuery('#resultTable').on('search.dt', function () {
            removePointers();
            var search_value = $('.dataTables_filter input').val();
            var req_json = CreatePlotsRequestForAllFieldTrials(search_value);

            console.log("server search query " + JSON.stringify(req_json));

            if (req_json) {
                $.ajax({
                    type: "POST",
                    url: server_url,
                    data: JSON.stringify(req_json),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8"
                }).done(function (ft_json) {
                    console.log("server search response " + JSON.stringify(ft_json));
                    if (ft_json['results'][0]['results'] != undefined) {

                        // yrtable.destroy();
                        $('#tableWrapper').html('  <div id="tableWrapper">\n' +
                            '            <table id="resultTable"></table>\n' +
                            '        </div>');
                        startFieldTrialGIS(ft_json['results'][0]['results'], type_param);
                        $('.dataTables_filter input').val(search_value);
                    }
                }).fail(function (req, status, error) {
                    console.info("req " + "status " + status + " error " + error);
                });
            }


        });
    } else {
        jQuery('#resultTable').on('search.dt', function () {
            removePointers();
            var searchData = yrtable.rows({filter: 'applied'}).data().toArray();
            var search_data = [];
            for (i = 0; i < searchData.length; i++) {
                if (searchData[i]['address']['address'] != undefined) {
                    if (searchData[i]['address']['address']['location']['centre'] != undefined) {
                        search_data.push(searchData[i]);
                    }
                }
            }
            displayFTLocations(search_data, type_param);
        });

    }


    // jQuery("#slider").bind("valuesChanging", function (e, data) {
    //     datemin = Date.parse(data.values.min);
    //     datemax = Date.parse(data.values.max);
    //
    //     yrtable.draw();
    // });
    //
    // if (!isCompany) {
    //     yrtable.column(13).visible(false);
    // }
}

function get_study_address(full, link_bool) {
    var addressInfo = '';
    if (full['address'] !== undefined && full['address']['address'] !== "undefined") {
        if (full['address']['address']['Address'] !== undefined && full['address']['address']['Address'] !== "undefined") {
            var address_name = (full['address']['address']['Address']['name'] != undefined) ? full['address']['address']['Address']['name'] + '<br/>' : "";
            var address_locality = (full['address']['address']['Address']['addressLocality'] != undefined) ? full['address']['address']['Address']['addressLocality'] + '<br/>' : "";
            var address_country = (full['address']['address']['Address']['addressCountry'] != undefined) ? full['address']['address']['Address']['addressCountry'] + '<br/>' : "";
            var address_postcode = (full['address']['address']['Address']['postalCode'] != undefined) ? full['address']['address']['Address']['postalCode'] : "";

            var link = (link_bool) ? 'class="newstyle_link"' : "";

            addressInfo = '<span ' + link + '> ' + address_name
                + address_locality
                + address_country
                + address_postcode + '</span>';
        }
    }
    return addressInfo;
}

function get_study_plots_link(full) {
    if (check_plots(full)) {
        var id = full['_id']['$oid'];

        /* remove the quotes */
        id = id.replace(/"/g, "");

        return '<a class=\"newstyle_link\" href=\"../dynamic/fieldtrialplots_dynamic.html?id=' + id + '\"  target=\"_blank\">View plots</a>';
    } else {
        return '';
    }
}

function check_plots(full) {
    if (full['_id'] != undefined) {
        if (full['number_of_plots'] != undefined) {
            if (full['number_of_plots'] > 0) {
                return true;
            }
        }
        if (full['plots'] != undefined) {
            if (full['plots'].length > 0) {
                return true;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function create_study_modal_html(array) {
    for (i = 0; i < array.length; i++) {
        var studyJson = array[i];
        var studyId = studyJson['_id']['$oid'];

        plotsModalInfo[studyId] = create_study_info_html(studyJson);

        if (studyJson['treatment_factors'] !== undefined) {
            if (studyJson['treatment_factors'] !== null) {
                if (studyJson['treatment_factors'].length !== 0) {
                    plotsModalInfo[studyId + 'treatment'] = generate_treatments_html(studyJson);
                }
            }
        }
    }

}

function create_study_info_html(studyJson) {
    var htmlarray = [];
    // htmlarray.push('<div class="container">');
    if (studyJson["parent_field_trial_name"] != undefined) {
        htmlarray.push('<div class="row">');
        htmlarray.push('<div class="col-2">');
        htmlarray.push('<b>Field Trial Name:</b> ');
        htmlarray.push('</div>');
        htmlarray.push('<div class="col-10">');
        htmlarray.push(studyJson["parent_field_trial_name"]);
        htmlarray.push('</div>');
        htmlarray.push('</div>');
        htmlarray.push('<br/>');
    }

    // htmlarray.push('Study Name: ' + studyJson['so:name'] + '<br/>');
    htmlarray.push('<div class="row">');
    htmlarray.push('<div class="col-2">');
    htmlarray.push('<b>Study Name:</b> ');
    htmlarray.push('</div>');
    htmlarray.push('<div class="col-10">');
    htmlarray.push(studyJson['so:name']);
    htmlarray.push('</div>');
    htmlarray.push('</div>');

    // htmlarray.push('Study Description: ' + SafePrint(studyJson['so:description']) + '<br/>');
    // htmlarray.push('<div class="row">');
    // htmlarray.push('<div class="col-2">');
    // htmlarray.push('<b>Study Description:</b> ');
    // htmlarray.push('</div>');
    // htmlarray.push('<div class="col-10">');
    // htmlarray.push(SafePrint(studyJson['so:description']));
    // htmlarray.push('</div>');
    // htmlarray.push('</div>');

    // htmlarray.push('Study Design: ' + SafePrint(studyJson['study_design']) + '<br/>');
    htmlarray.push('<div class="row">');
    htmlarray.push('<div class="col-2">');
    htmlarray.push('<b>Study Design:</b> ');
    htmlarray.push('</div>');
    htmlarray.push('<div class="col-10">');
    htmlarray.push(SafePrint(studyJson['study_design']));
    htmlarray.push('</div>');
    htmlarray.push('</div>');

    // htmlarray.push('Phenotype Gathering Note: ' + SafePrint(studyJson['phenotype_gathering_notes']) + '<br/>');
    htmlarray.push('<div class="row">');
    htmlarray.push('<div class="col-2">');
    htmlarray.push('<b>Team:</b> ');
    htmlarray.push('</div>');
    htmlarray.push('<div class="col-10">');
    htmlarray.push(SafePrint(studyJson['team']));
    htmlarray.push('</div>');
    htmlarray.push('</div>');
    htmlarray.push('<br/>');

    // htmlarray.push('Sowing Date: ' + SafePrint(studyJson['sowing_date']) + '<br/>');
    htmlarray.push('<div class="row">');
    htmlarray.push('<div class="col-2">');
    htmlarray.push('<b>Sowing Date:</b> ');
    htmlarray.push('</div>');
    htmlarray.push('<div class="col-10">');
    htmlarray.push(SafePrint(studyJson['sowing_date']));
    htmlarray.push('</div>');
    htmlarray.push('</div>');

    // htmlarray.push('Harvest Date: ' + SafePrint(studyJson['harvest_date']) + '<br/>');
    htmlarray.push('<div class="row">');
    htmlarray.push('<div class="col-2">');
    htmlarray.push('<b>Harvest Date:</b> ');
    htmlarray.push('</div>');
    htmlarray.push('<div class="col-10">');
    htmlarray.push(SafePrint(studyJson['harvest_date']));
    htmlarray.push('</div>');
    htmlarray.push('</div>');

    // htmlarray.push('Plots: ' + get_study_plots_link(studyJson) + '<br/>');
    htmlarray.push('<div class="row">');
    htmlarray.push('<div class="col-2">');
    htmlarray.push('<b>Plots:</b> ');
    htmlarray.push('</div>');
    htmlarray.push('<div class="col-10">');
    htmlarray.push(get_study_plots_link(studyJson));
    htmlarray.push('</div>');
    htmlarray.push('</div>');
    htmlarray.push('<br/>');

    // htmlarray.push('Address: ' + get_study_address(studyJson, false) + '<br/>');
    htmlarray.push('<div class="row">');
    htmlarray.push('<div class="col-2">');
    htmlarray.push('<b>Address:</b> ');
    htmlarray.push('</div>');
    htmlarray.push('<div class="col-10">');
    htmlarray.push(get_study_address(studyJson, false));
    htmlarray.push('</div>');
    htmlarray.push('</div>');

    // htmlarray.push('</div>');
    htmlarray.push('<hr/>');
    // console.log(generate_treatments_html(studyJson));
    return htmlarray.join("");

}


function removePointers() {
    map.removeLayer(markersGroup2);
    // if (pie_view) {
    //     markersGroup = new L.MarkerClusterGroup({
    //         maxClusterRadius: 2 * 30,
    //         iconCreateFunction: defineClusterIcon
    //     });
    // }
    // else {
    markersGroup2 = new L.MarkerClusterGroup();
    // }
}

//
// jQuery.fn.dataTableExt.afnFiltering.push(
//     function (oSettings, aData, iDataIndex) {
//         var dateStart = datemin;
//         var dateEnd = datemax;
//
//         var evalDate = Date.parse(aData[5]);
//
//         if (((evalDate >= dateStart && evalDate <= dateEnd) || (evalDate >= dateStart && dateEnd == 0)
//                 || (evalDate >= dateEnd && dateStart == 0)) || (dateStart == 0 && dateEnd == 0)) {
//             return true;
//         }
//         else {
//             return false;
//         }
//
//     });


function displayFTLocations(array, type_param) {
    for (i = 0; i < array.length; i++) {
        var la = '';
        var lo = '';
        var country = '';
        var town = '';
        var name = '';

        var fieldTrialName = array[i]['so:name'];
        var team = array[i]['team'];

        var sowing_date = (array[i]['sowing_date'] != undefined) ? array[i]['sowing_date'] : " ";
        var harvest_date = (array[i]['harvest_date'] != undefined) ? array[i]['harvest_date'] : " ";


        la = array[i]['address']['address']['location']['centre']['latitude'];
        lo = array[i]['address']['address']['location']['centre']['longitude'];

        if (array[i]['address']['address']['Address'] != undefined) {
            if (array[i]['address']['address']['Address']['addressCountry'] != undefined) {
                country = array[i]['address']['address']['Address']['addressCountry'];
            }
            if (array[i]['address']['address']['Address']['addressLocality'] != undefined) {
                town = array[i]['address']['address']['Address']['addressLocality'];
            }
            if (array[i]['address']['address']['Address']['name'] != undefined) {
                name = array[i]['address']['address']['Address']['name'];
            }
        }
        var id = array[i]['_id']['$oid'];
        /* remove the quotes */
        id = id.replace(/"/g, "");
        // var popup_note = '<b>Field Trial Name: </b>' + fieldTrialName + '<br/>'
        //     + '<b>Team: </b>' + team + '<br/>'
        //     + '<b>Sowing Date: </b>' + sowing_date + '<br/>'
        //     + '<b>Harvest Date: </b>' + harvest_date + '<br/>'
        //     // + '<u class=\"newstyle_link\" onclick="plot_colorbox(\'' + id + '\');" style="cursor: pointer;">View plots</u>'
        //     + '<a class=\"newstyle_link\" href=\"../dynamic/fieldtrialplots_dynamic.html?id=' + id + '\" target="_blank">View plots</a>'
        // ;
        var popup_note = create_study_info_html(array[i])
        addFTPointer(la, lo, popup_note);
        // if (type_param !== 'AllFieldTrials') {
        if (array[i]['shape_data'] !== null && array[i]['shape_data'] !== undefined && array[i]['shape_data'] !== '') {
            let geo_json = JSON.parse(array[i]['shape_data']);
            var shape_layer = L.geoJson(geo_json);
            markersGroup2.addLayer(shape_layer);
        }
        // }
    }
    map.addLayer(markersGroup2);


}

function plot_colorbox(id) {
    var plot_data = plotsHTMLArray[id];

    // $('#modal-body').html(plot_data);
    $.colorbox({width: "80%", html: plot_data});
    // $('#plotModal').modal('show');
}


function addFTPointer(la, lo, note) {

    var blueIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-blue.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var redIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-red.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var greenIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-green.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var orangeIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-orange.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var yellowIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-yellow.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var violetIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-violet.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var greyIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-grey.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var blackIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-black.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    var markerLayer;
    // if (type === 'Breeder') {
    //     markerLayer = L.marker([la, lo], {icon: greenIcon}).bindPopup(note);
    // }
    // else {
    markerLayer = L.marker([la, lo]).bindPopup(note);
    // }
    // markers.push(markerLayer);
    markersGroup2.addLayer(markerLayer);

}


// function popup(msg) {
//     L.popup()
//         .setLatLng([52.621615, 8.219])
//         .setContent(msg)
//         .openOn(map);
// }


// function createPlotsHTML(array) {
//     for (i = 0; i < array.length; i++) {
//         var expAreaId = array[i]['_id']['$oid'];
//         var plots = array[i]['plots'];
//         var htmlarray = [];
//
//         var row = 1;
//         var column = 1;
//
//         for (j = 0; j < plots.length; j++) {
//
//             if (plots[j]['row_index'] === row) {
//                 if (plots[j]['column_index'] === column) {
//                     htmlarray.push(formatPlot(plots[j]));
//                     column++;
//                 }
//             } else if (plots[j]['row_index'] > row) {
//
//                 row++;
//                 column = 2;
//                 htmlarray.push('</tr><tr>');
//                 htmlarray.push('<td>' + row + '</td>');
//                 htmlarray.push(formatPlot(plots[j]));
//             }
//         }
//         var tableString = '<td>1</td>' + htmlarray.join("");
//         var tableArray = tableString.split("</tr><tr>");
//         var reversedString = tableArray.reverse().join("</tr><tr>");
//         plotsHTMLArray[expAreaId] = '<div id="plot"><table class="table " id="' + expAreaId + '" style="margin:20px;"><tr>' + reversedString + '</tr></table></div>';
//     }
//
// }

function formatPlot(plot, plot_block_rows, plot_block_columns) {
    let plotId = plot['_id']['$oid'];
    let current_row = parseInt(plot['row_index']);
    let current_column = parseInt(plot['column_index']);
    let accession = "";
    for (r = 0; r < plot['rows'].length; r++) {
        accession += " " + plot['rows'][r]['material']['accession'];
    }

    // return '<td>' + accession + '</td>';
    // var replicate_index = plot['replicate'];
    var color;
    // if (colorJSON[replicate_index]==undefined){
    //    color = getRandomColor();
    //    colorJSON[replicate_index] = color;
    // } else {
    // color = colorJSON[replicate_index];
    color = '#ABEBC6';
    // }
    plotsModalInfo[plotId] = formatPlotModal(plot);

    // return '<td style="cursor:pointer; font-size: 0.8rem; background-color:' + color + '" onclick="plotModal(\'' + plotId + '\')">' + replicate_index + '/' + accession + '</td>';
    // return '<td class="plot" id="' + plotId + '" style="cursor:pointer; font-size: 0.8rem;  background-color:' + color + '" onclick="plotModal(\'' + plotId + '\')">Row:' + plot['row_index'] + ' Column:' + plot['column_index'] + '</td>';

    let padding = plot_gap_calculator(current_column, current_row, plot_block_columns, plot_block_rows);
    return '<td style="' + padding + '"><div class="plot" id="' + plotId + '" style="padding:5px; cursor:pointer; font-size: 0.8rem;  background-color:' + color + '" onclick="plotModal(\'' + plotId + '\')">Row:' + current_row + ' Column:' + current_column + '</div></td>';
}

function plot_gap_calculator(current_column, current_row, plot_block_columns, plot_block_rows) {
    let padding = 'padding:5px;';
    if (current_column % plot_block_columns === 0 && current_row % plot_block_rows === 0) {
        console.log('both');
        padding = 'padding:30px 30px 5px 5px;';
    } else if (current_column % plot_block_columns === 0) {
        console.log('ver');
        padding = 'padding:5px 30px 5px 5px;';
    } else if (current_row % plot_block_rows === 0) {
        console.log('hori');
        padding = 'padding:30px 5px 5px 5px;';
    }
    return padding;
}

function plotModal(plotId) {
    $('#modal-body').html(plotsModalInfo[plotId]);
    $('#plotModal').modal('show');

    let searchStr = '';
    for (i = 0; i < plot_json.length; i++) {
        if (plot_json[i]['_id']['$oid'] === plotId) {
            var plot = plot_json[i];
            for (r = 0; r < plot['rows'].length; r++) {
                let this_accession = SafePrint(plot['rows'][r]['material']['accession']);
                get_GRU_by_accession(this_accession, plotId, r);
                searchStr = this_accession;
            }
        }
    }

    for (j = 0; j < plot_json.length; j++) {
        const loop_plotId = plot_json[j]['_id']['$oid'];
        if (loop_plotId !== plotId) {
            var rows = plot_json[j]['rows'];
            for (jr = 0; jr < rows.length; jr++) {
                var accession = rows[jr]['material']['accession'];
                if (accession != undefined) {
                    if (searchStr === accession && searchStr !== '') {
                        let formatted_plot = format_plot_rows(plot_json[j], true);
                        $('#rowsInfo').append(formatted_plot['rowsInfo'].join(""));
                        $('#phenotypes').append(formatted_plot['phenotypes'].join(""));
                        break;
                    }
                }
            }
        }

    }

}

function formatPlotModal(plot) {

    let htmlarray = [];
    let phenotypearray = [];
    let rowsInfoarray = [];

    rowsInfoarray.push('<table class="table racks"><thead><tr><th>Replicate</th><th>Rack</th><th>Accession</th><th>Pedigree</th><th>Gene Bank</th><th>Links</th><th>Treatments</th></tr></thead><tbody id="rowsInfo">');
    phenotypearray.push('<table class="table plots"><thead><tr><th>Replicate</th><th>Rack</th><th>Date</th><th>Raw Value</th><th>Corrected Value</th><th>Trait</th><th>Measurement</th><th>Unit</th></tr></thead><tbody id="phenotypes">');

    let formatted_plot = format_plot_rows(plot, false);

    rowsInfoarray = rowsInfoarray.concat(formatted_plot['rowsInfo']);
    phenotypearray = phenotypearray.concat(formatted_plot['phenotypes']);

    rowsInfoarray.push('</tbody></table>');
    phenotypearray.push('</tbody></table>');
    htmlarray.push('<div class="row justify-content-between">');
    htmlarray.push('<div class="col-4">');
    htmlarray.push('Row: ' + plot['row_index'] + '<br/>');
    htmlarray.push('Column: ' + plot['column_index'] + '<br/>');
    htmlarray.push('Length: ' + SafePrint_with_value(plot['length'], default_length) + 'm<br/>');
    htmlarray.push('Width: ' + SafePrint_with_value(plot['width'], default_width) + 'm<br/>');
    htmlarray.push('Study Design: ' + SafePrint_with_value(plot['study_design'], default_design) + '<br/>');
    htmlarray.push('Sowing Date: ' + SafePrint_with_value(plot['sowing_date'], default_sowing_date) + '<br/>');
    htmlarray.push('Harvest Date: ' + SafePrint_with_value(plot['harvest_date'], default_harvest_date) + '<br/>');
    htmlarray.push('Sowing Order: ' + SafePrint(plot['sowing_order']) + '<br/>');
    htmlarray.push('Walking Order: ' + SafePrint(plot['walking_order']) + '<br/>');
    // htmlarray.push('Treatment: ' + SafePrint(plot['treatment']) + '<br/>');
    htmlarray.push('Comment: ' + SafePrint(plot['comment']) + '<br/>');

    // if (plot['so:url'] != undefined) {
    //     var link = plot['so:url'];
    //     htmlarray.push('Link: <a href="' + link + '" target="_blank">' + link + '</a><br/>');
    // }
    htmlarray.push('</div>');
    htmlarray.push('<div class="col-4">');
    if (plot['so:image'] != undefined) {
        if (plot['so:image']['contentUrl'] != undefined && plot['so:image']['thumbnail']) {
            let contentUrl = plot['so:image']['contentUrl'];
            let thumbnail = plot['so:image']['thumbnail'];
            htmlarray.push('<a <a href="' + contentUrl + '" target="_blank"><img height="300" src=" ' + thumbnail + '"/></a>');
        }
    }
    htmlarray.push('</div>');
    htmlarray.push('</div>');
    htmlarray.push(formatted_treatments);
    htmlarray.push('<hr/>');
    htmlarray.push(rowsInfoarray.join(""));
    htmlarray.push('<hr/>');
    htmlarray.push('<h5>Phenotypes</h5>');
    htmlarray.push(phenotypearray.join(""));

    return htmlarray.join("");


}

function format_plot_rows(plot, replicate_bool) {
    let plotId = plot['_id']['$oid'];
    let formatted_plot = {};
    let phenotypearray = [];
    let rowsInfoarray = [];
    // rowsInfoarray.push('<table class="table racks"><thead><tr><th>Replicate</th><th>Rack</th><th>Accession</th><th>Pedigree</th><th>Gene Bank</th><th>Links</th></tr></thead><tbody>');
    // phenotypearray.push('<table class="table plots"><thead><tr><th>Replicate</th><th>Rack</th><th>Date</th><th>Raw Value</th><th>Corrected Value</th><th>Trait</th><th>Measurement</th><th>Unit</th></tr></thead><tbody>');
    let replicate = ' (Current Plot)';
    if (replicate_bool) {
        replicate = ' <u style="cursor:pointer;" onclick="plotModal(\'' + plotId + '\')">(Plot Row:' + plot['row_index'] + ' - Col:' + plot['column_index'] + ')</u>';
    }

    for (r = 0; r < plot['rows'].length; r++) {
        // var random_id = generate_random_id();
        var replicate_index = plot['rows'][r]['replicate'];
        var color = colorJSON[replicate_index];
        var accession = SafePrint(plot['rows'][r]['material']['accession']);
        var pedigree = SafePrint(plot['rows'][r]['material']['pedigree']);
        var treatments = plot['rows'][r]['treatments'];
        rowsInfoarray.push('<tr>');
        rowsInfoarray.push('<td style="background-color:' + color + '">' + SafePrint(replicate_index) + replicate + '</td>');
        rowsInfoarray.push('<td>' + SafePrint(plot['rows'][r]['rack_index']) + '</td>');
        rowsInfoarray.push('<td>' + accession + '</td>');
        rowsInfoarray.push('<td>' + pedigree + '</td>');
        rowsInfoarray.push('<td><a class="newstyle_link" target="_blank" href="' + SafePrint(plot['rows'][r]['material']['gene_bank']['so:url']) + '">' + SafePrint(plot['rows'][r]['material']['gene_bank']['so:name']) + '</a></td>');
        //rowsInfoarray.push('<td id="' + random_id + '"></td>');
        rowsInfoarray.push('<td id="' + plotId + '_' + r + '"></td>');
        if (treatments !== null && treatments !== [] && treatments !== undefined) {
            rowsInfoarray.push('<td>' + format_plot_treatment(treatments) + '</td>');
        } else {
            rowsInfoarray.push('<td></td>');
        }
        rowsInfoarray.push('<tr>');
        // get_GRU_by_accession(accession, plotId, random_id);

        if (plot['rows'][r]['observations'] != undefined) {
            for (o = 0; o < plot['rows'][r]['observations'].length; o++) {
                var observation = plot['rows'][r]['observations'][o];

                phenotypearray.push('<tr>');
                phenotypearray.push('<td style="background-color:' + color + '">' + SafePrint(replicate_index) + replicate + '</td>');
                phenotypearray.push('<td>' + SafePrint(plot['rows'][r]['rack_index']) + '</td>');
                phenotypearray.push('<td>' + SafePrint(observation['date']) + '</td>');
                phenotypearray.push('<td>' + SafePrint(observation['raw_value']) + '</td>');
                phenotypearray.push('<td>' + SafePrint(observation['corrected_value']) + '</td>');
                if (observation['phenotype']['trait']['so:sameAs'].startsWith('CO')) {
                    phenotypearray.push('<td class="tooltip-test"  title="' + observation['phenotype']['trait']['so:description'] + '"><a class="newstyle_link" target="_blank" href="http://www.cropontology.org/terms/' + observation['phenotype']['trait']['so:sameAs'] + '/">' + observation['phenotype']['trait']['so:name'] + '</a></td>');

                } else {
                    phenotypearray.push('<td class="tooltip-test"  title="' + observation['phenotype']['trait']['so:description'] + '">' + observation['phenotype']['trait']['so:name'] + '</td>');
                }
                if (observation['phenotype']['measurement']['so:sameAs'].startsWith('CO')) {
                    phenotypearray.push('<td data-toggle="tooltip" title="' + observation['phenotype']['measurement']['so:description'] + '"><a class="newstyle_link" target="_blank" href="http://www.cropontology.org/terms/' + observation['phenotype']['measurement']['so:sameAs'] + '/">' + observation['phenotype']['measurement']['so:name'] + '</td>');

                } else {
                    phenotypearray.push('<td data-toggle="tooltip" title="' + observation['phenotype']['measurement']['so:description'] + '">' + observation['phenotype']['measurement']['so:name'] + '</td>');
                }
                if (observation['phenotype']['unit']['so:sameAs'].startsWith('CO')) {
                    phenotypearray.push('<td data-toggle="tooltip"><a class="newstyle_link" target="_blank" href="http://www.cropontology.org/terms/' + observation['phenotype']['unit']['so:sameAs'] + '/">' + observation['phenotype']['unit']['so:name'] + '</td>');

                } else {
                    phenotypearray.push('<td>' + observation['phenotype']['unit']['so:name'] + '</td>');
                }
                phenotypearray.push('</tr>');
            }
        }

        // plotsGRUArray[plotId] = plotGRULinkArray;
    }
    // rowsInfoarray.push('</tbody></table>');
    // phenotypearray.push('</tbody></table>');

    formatted_plot['rowsInfo'] = rowsInfoarray;
    formatted_plot['phenotypes'] = phenotypearray;

    return formatted_plot;
}

function format_plot_treatment(treatments) {
    let htmlarray = [];
    for (i = 0; i < treatments.length; i++) {
        htmlarray.push(treatments[i]['so:sameAs'] + ' - ' + treatments[i]['label']);
        htmlarray.push('<br/>');
    }
    return htmlarray.join(' ');
}

// function get_GRU_by_accession(accession) {
function get_GRU_by_accession(accession, plotId, r) {
    $.ajax({
        type: "GET",
        url: '/seedstor/apisearch-unified.php?query=' + accession,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (gru_json) {
            var links = format_gru_json(gru_json);
            $('#' + plotId + '_' + r).html(links);
            // var linksjson = {};
            // linksjson['plotId'] = plotId;
            // linksjson['id'] = id;
            // linksjson['links'] = links;
            // plotsGRUArray.push(linksjson);
        }
    });
}


// }

function format_gru_json(gru_json) {
    var htmlarray = [];
    if (gru_json != undefined && gru_json.length > 0) {
        for (i = 0; i < gru_json.length; i++) {
            // if (gru_json.length > 0) {
            if (gru_json[0]['idPlant'] != undefined) {
                var idPlant = gru_json[i]['idPlant'];
                htmlarray.push('<a target="_blank" class="newstyle_link" href="https://www.seedstor.ac.uk/search-infoaccession.php?idPlant=' + idPlant + '">Plant ' + idPlant + '</a> ');
            }
        }
    }
    return htmlarray.join('');
}

/**
 * Get empty strings instead of undefeined variables
 *
 * @param obj The object to check.
 */
function SafePrint(obj) {
    if (obj === undefined || obj === null) {
        return "";
    } else {
        return obj;
    }
}

function SafePrint_with_value(obj, value) {
    if (obj === undefined || obj === null) {
        return value;
        console.log(value);
    } else {
        return obj;
    }
}


function CreatePlotsRequestForExperimentalArea(exp_area_id) {

    var request =
        {
            "services": [{
                "so:name": "Search Field Trials",
                "start_service": true,
                "parameter_set": {
                    "level": "advanced",
                    "parameters": [{
                        "param": "ST Id",
                        "current_value": exp_area_id
                    }, {
                        "param": "Get all Plots for Study",
                        "current_value": true
                    }, {
                        "param": "ST Search Studies",
                        "current_value": true
                    }]
                }
            }]
        };
    console.log(JSON.stringify(request));

    return request;
}

function CreatePlotsRequestForFieldTrial(fieldtrial_id) {

    var request = {
        "services": [{
            "start_service": true,
            "so:name": "Search Field Trials",
            "parameter_set": {
                "level": "advanced",
                "parameters": [
                    {
                        "param": "FT Id",
                        "current_value": fieldtrial_id
                    },
                    {
                        "param": "FT Trial Facet",
                        "current_value": true
                    },
                    {
                        "param": "FT Results Page Number",
                        "current_value": 0
                    },
                    {
                        "param": "FT Results Page Size",
                        "current_value": 100
                    }
                ]
            }
        }]
    };

    console.log(JSON.stringify(request));

    return request;

}

function CreatePlotsRequestForAllFieldTrials(keyword) {
    // let facet = 'Study';
    // if (keyword === '') {
    //     facet = 'Field Trial';
    // }
    var request = {
        "services": [
            {
                "so:name": "Search Field Trials",
                "start_service": true,
                "parameter_set": {
                    "level": "simple",
                    "parameters": [
                        {
                            "param": "FT Keyword Search",
                            "current_value": keyword
                        },
                        {
                            "param": "FT Study Facet",
                            "current_value": true
                        },
                        {
                            "param": "FT Results Page Number",
                            "current_value": 0
                        },
                        {
                            "param": "FT Results Page Size",
                            "current_value": 100
                        }
                    ]
                }
            }
        ]
    };

    console.log(JSON.stringify(request));

    return request;

}

// plot page

let default_length = "";
let default_width = "";
let default_design = "";
let default_sowing_date = "";
let default_harvest_date = "";

function LoadTable(experimental_area_json) {
    $('#control').show();
    console.log(JSON.stringify(experimental_area_json));
    var jsonArray = experimental_area_json['results'][0]['results'];

    default_length = SafePrint(jsonArray[0]['data']['plot_length']);
    default_width = SafePrint(jsonArray[0]['data']['plot_width']);
    default_design = SafePrint(jsonArray[0]['data']['study_design']);
    default_sowing_date = SafePrint(jsonArray[0]['data']['sowing_date']);
    default_harvest_date = SafePrint(jsonArray[0]['data']['harvest_date']);

    // console.log(">>>>>>>>>>>>"+default_sowing_date);
    var filtered_data = [];
    jQuery('#status').html('');
    var fieldTrialName = '';
    var team = '';
    for (i = 0; i < jsonArray.length; i++) {
        let exp_area = jsonArray[i]['data'];

        let plots_table = GeneratePlotsForExperimentalArea(exp_area);
        $('#plots').html(plots_table);
        /*
                        for (j = 0; j < exp_areas_array.length; j++) {
                            let address = exp_areas_array [j]['address'];

                            if (address != undefined) {

                                fieldTrialName = jsonArray [i]['data']['so:name'];
                                team = jsonArray [i]['data']['team'];
                                if (address ['address']['location']['centre'] != undefined) {
                                    filtered_data.push (exp_areas_array [j]);
                                }
                            }
                        }
        */
    }
    // console.log(JSON.stringify(plotsHTMLArray));

}

function GeneratePlotsForExperimentalArea(experimental_area_json) {
    console.log(JSON.stringify(experimental_area_json));

    plot_json = experimental_area_json['plots'];
    let expAreaId = experimental_area_json['_id']['$oid'];
    let plots = experimental_area_json['plots'];

    let plot_block_rows = parseInt(experimental_area_json['plot_block_rows']);
    let plot_block_columns = parseInt(experimental_area_json['plot_block_columns']);

    formatted_treatments = generate_treatments_html(experimental_area_json);

    if (plots.length > 0) {
        var htmlarray = [];

        var row = 1;
        var column = 1;

        for (j = 0; j < plots.length; j++) {

            if (plots[j]['row_index'] === row) {
                if (plots[j]['column_index'] === column) {
                    htmlarray.push(formatPlot(plots[j], plot_block_rows, plot_block_columns));
                    column++;
                }
            } else if (plots[j]['row_index'] > row) {

                let current_row = parseInt(plots[j]['row_index']);
                let current_column = parseInt(plots[j]['column_index']);
                row++;
                column = 2;
                htmlarray.push('</tr><tr>');
                let padding = plot_gap_calculator(current_column, current_row, plot_block_columns, plot_block_rows);
                htmlarray.push('<td  style="' + padding + '">' + row + '</td>');
                htmlarray.push(formatPlot(plots[j], plot_block_rows, plot_block_columns));
            }
        }
        var tableString = '<td>1</td>' + htmlarray.join("");
        var tableArray = tableString.split("</tr><tr>");
        var reversedString = tableArray.reverse().join("</tr><tr>");

        // return '<div id="plot"><table class="table " id="' + expAreaId + '" style="margin:20px; border-spacing:5px; border-collapse:separate;"><tr>' + reversedString + '</tr></table></div>';
        return '<div id="plot"><table class="table " id="' + expAreaId + '" style="margin:20px; "><tr>' + reversedString + '</tr></table></div>';
    } else {
        return '<div id="plot"><p>No plot data available.</p></div>'
    }
}

function generate_treatments_html(experimental_area_json) {
    var htmlarray = [];
    if (experimental_area_json['treatment_factors'] !== undefined && experimental_area_json['treatment_factors'] !== null) {
        if (experimental_area_json['treatment_factors'].length > 0) {
            var treatment_factors = [];
            treatment_factors = experimental_area_json['treatment_factors'];

            htmlarray.push('<table class="table"><thead><tr><th>Treatment</th><th>Ontology term</th><th width="50%">Description</th><th>Values</th></tr></thead><tbody>');
            for (j = 0; j < treatment_factors.length; j++) {
                var treatment = treatment_factors[j];
                var ontology = treatment['treatment']['so:sameAs'];

                htmlarray.push('<tr>');
                htmlarray.push('<td>' + treatment['treatment']['so:name'] + '</td>');
                htmlarray.push('<td><a class="newstyle_link" target="_blank" href="https://browser.planteome.org/amigo/term/' + ontology + '">' + ontology + '</a></td>');
                htmlarray.push('<td>' + treatment['treatment']['so:description'] + '</td>');

                htmlarray.push('<td>');
                for (i = 0; i < treatment['values'].length; i++) {
                    var this_value = treatment['values'][i];
                    htmlarray.push(this_value['Label'] + ': ' + this_value['Value'] + '<br/>');
                }
                htmlarray.push('</td>');
                htmlarray.push('</tr>');
            }
            htmlarray.push('</tbody></table>');
        }
    }
    return htmlarray.join(' ');

}

function filter_plot() {
    $('.plot').css('background-color', '#ABEBC6');
    $('#filter_result').html('');
    var result = 0;
    var searchStr = $('#searchPlotsInput').val().toLowerCase();
    if (searchStr !== '') {
        for (i = 0; i < plot_json.length; i++) {
            // var bool = false;
            const plotId = plot_json[i]['_id']['$oid'];
            var rows = plot_json[i]['rows'];
            for (r = 0; r < rows.length; r++) {
                var accession = rows[r]['material']['accession'].toLowerCase();
                if (accession != undefined) {
                    if (searchStr === accession || accession.includes(searchStr)) {
                        // bool = true;
                        $('#' + plotId).css('background-color', '#2ECC40');
                        result++;
                        break;
                    }
                }
            }
            // if (bool) {
            //     var plotId = plot_json[i]['_id']['$oid'];
            //     console.log(plotId);
            //     $('#' + plotId).css('background-color', '#FF4136');
            // }
        }
    }
    $('#filter_result').html('<p>Filtered result: ' + result + '</p>');
}




