var plotsHTMLArray = {};
var plotsGRUArray = [];
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
    8: "#2ECC40"
};
var plotsModalInfo = {};

function startFieldTrialGIS(jsonArray, type_param) {
    console.log(JSON.stringify(jsonArray));
    var filtered_data_with_location = [];
    var filtered_data_without_location = [];
    jQuery('#status').html('');
    var fieldTrialName = '';
    var team = '';
    for (i = 0; i < jsonArray.length; i++) {
        if (type_param === 'Grassroots:FieldTrial' || type_param === 'AllFieldTrials') {
            fieldTrialName = jsonArray[i]['data']['so:name'];
            team = jsonArray[i]['data']['team'];
            if (jsonArray[i]['data']['studies'] != null) {
                for (j = 0; j < jsonArray[i]['data']['studies'].length; j++)
                    if (jsonArray[i]['data']['studies'][j]['address'] != undefined) {
                        if (jsonArray[i]['data']['studies'][j]['address']['address']['location']['centre'] != undefined) {
                            var study_json = jsonArray[i]['data']['studies'][j];
                            study_json["team"] = team;
                            study_json["parent_field_trial_name"] = fieldTrialName;
                            filtered_data_with_location.push(study_json);
                        }
                    } else {
                        var study_json = jsonArray[i]['data']['studies'][j];
                        study_json["team"] = team;
                        study_json["so:name"] = fieldTrialName;
                        filtered_data_without_location.push(study_json);
                    }
            } else {
                filtered_data_without_location.push(jsonArray[i]['data']);
            }
        } else if (type_param === 'Grassroots:Study') {
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

    displayFTLocations(filtered_data_with_location);

    create_study_modal_html(filtered_data_without_location.concat(filtered_data_with_location));
}

function produceFieldtrialTable(data, type_param) {
    // yrtable.destroy();
    yrtable = jQuery('#resultTable').DataTable({
        data: data,
        "columns": [
            {
                title: "Name",
                "render": function (data, type, full, meta) {
                    return full['so:name'];
                }
            },
            {
                title: "Team",
                "render": function (data, type, full, meta) {
                    return full['team'];
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
            }
            ,
            {
                title: "Additional Info",
                "render": function (data, type, full, meta) {
                    var studyId = full['_id']['$oid'];
                    return '<span style="cursor:pointer;" class="newstyle_link" onclick="plotModal(\'' + studyId + '\')">Study Info</span>';
                }
            }

        ]

    });

    jQuery('#resultTable tbody').on('click', 'td', function () {
        var cellIdx = yrtable.cell(this).index();
        var rowIdx = cellIdx['row'];
        var json = yrtable.row(rowIdx).data();
        if (json['address'] != undefined) {
            if (json['address']['address']['location']['centre'] != undefined) {
                var la = json['address']['address']['location']['centre']['latitude'];
                var lo = json['address']['address']['location']['centre']['longitude'];
                map.setView([la, lo], 16, {animate: true});
            }
        }
        $(window).scrollTop($('#map').offset().top - 90);

    });

    if (type_param === 'AllFieldTrials') {
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


            // var searchData = yrtable.rows({filter: 'applied'}).data().toArray();
            // var search_data = [];
            // for (i = 0; i < searchData.length; i++) {
            //     if (searchData[i]['address']['address'] != undefined) {
            //         if (searchData[i]['address']['address']['location']['centre'] != undefined) {
            //             search_data.push(searchData[i]);
            //         }
            //     }
            // }
            // displayFTLocations(search_data);
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
            displayFTLocations(search_data);
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
    if (full['_id'] != undefined && full['number_of_plots'] != undefined) {
        if (full['number_of_plots'] > 0) {
            var id = full['_id']['$oid'];

            /* remove the quotes */
            id = id.replace(/"/g, "");

            return '<a class=\"newstyle_link\" href=\"../dynamic/fieldtrialplots_dynamic.html?id=' + id + '\"  target=\"_blank\">View plots</a>';
        } else {
            return '';
        }
    } else {
        return '';
    }
}

function create_study_modal_html(array) {
    for (i = 0; i < array.length; i++) {
        var studyJson = array[i];
        var studyId = studyJson['_id']['$oid'];

        plotsModalInfo[studyId] = create_study_info_html(studyJson);
    }

}

function create_study_info_html(studyJson) {
    var htmlarray = [];

    if (studyJson["parent_field_trial_name"] != undefined) {
        htmlarray.push('Field Trail Name: ' + studyJson["parent_field_trial_name"]);
    }

    htmlarray.push('Study Name: ' + studyJson['so:name'] + '<br/>');
    htmlarray.push('Study Description: ' + SafePrint(studyJson['so:description']) + '<br/>');
    htmlarray.push('Study Design: ' + SafePrint(studyJson['study_design']) + '<br/>');
    htmlarray.push('Phenotype Gathering Note: ' + SafePrint(studyJson['phenotype_gathering_notes']) + '<br/>');
    htmlarray.push('Sowing Date: ' + SafePrint(studyJson['sowing_date']) + '<br/>');
    htmlarray.push('Harvest Date: ' + SafePrint(studyJson['harvest_date']) + '<br/>');
    htmlarray.push('Plots: ' + get_study_plots_link(studyJson) + '<br/>');
    htmlarray.push('Address: ' + get_study_address(studyJson, false) + '<br/>');
    htmlarray.push('<hr/>');

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


function displayFTLocations(array) {
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


function createPlotsHTML(array) {
    for (i = 0; i < array.length; i++) {
        var expAreaId = array[i]['_id']['$oid'];
        var plots = array[i]['plots'];
        var htmlarray = [];

        var row = 1;
        var column = 1;

        for (j = 0; j < plots.length; j++) {

            if (plots[j]['row_index'] === row) {
                if (plots[j]['column_index'] === column) {
                    htmlarray.push(formatPlot(plots[j]));
                    column++;
                }
            } else if (plots[j]['row_index'] > row) {

                row++;
                column = 2;
                htmlarray.push('</tr><tr>');
                htmlarray.push('<td>' + row + '</td>');
                htmlarray.push(formatPlot(plots[j]));
            }
        }
        var tableString = '<td>1</td>' + htmlarray.join("");
        var tableArray = tableString.split("</tr><tr>");
        var reversedString = tableArray.reverse().join("</tr><tr>");
        plotsHTMLArray[expAreaId] = '<div id="plot"><table class="table " id="' + expAreaId + '" style="margin:20px;"><tr>' + reversedString + '</tr></table></div>';
    }

}

function formatPlot(plot) {
    var plotId = plot['_id']['$oid'];
    var accession = "";
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
    color = colorJSON[8];
    // }
    plotsModalInfo[plotId] = formatPlotModal(plot);

    // return '<td style="cursor:pointer; font-size: 0.8rem; background-color:' + color + '" onclick="plotModal(\'' + plotId + '\')">' + replicate_index + '/' + accession + '</td>';
    return '<td style="cursor:pointer; font-size: 0.8rem; background-color:' + color + '" onclick="plotModal(\'' + plotId + '\')">Row:' + plot['row_index'] + ' Column:' + plot['column_index'] + '</td>';
}

function plotModal(plotId) {
    $('#modal-body').html(plotsModalInfo[plotId]);
    $('#plotModal').modal('show');
    for (r = 0; r < plotsGRUArray.length; r++) {

        var linksJson = plotsGRUArray[r];
        if (linksJson['plotId'] === plotId) {
            $('#' + linksJson['id']).html(linksJson['links'] + ' ');
        }
    }

}

function formatPlotModal(plot) {

    var plotId = plot['_id']['$oid'];
    var htmlarray = [];
    var phenotypearray = [];
    var rowsInfoarray = [];

    rowsInfoarray.push('<table class="table racks"><thead><tr><th>Replicate</th><th>Rack</th><th>Accession</th><th>Pedigree</th><th>Gene Bank</th><th>Links</th></tr></thead><tbody>');
    phenotypearray.push('<table class="table plots"><thead><tr><th>Replicate</th><th>Rack</th><th>Date</th><th>Raw Value</th><th>Corrected Value</th><th>Trait</th><th>Measurement</th><th>Unit</th></tr></thead><tbody>');

    for (r = 0; r < plot['rows'].length; r++) {
        var random_id = generate_random_id();
        var replicate_index = plot['rows'][r]['replicate'];
        var color = colorJSON[replicate_index];
        var accession = SafePrint(plot['rows'][r]['material']['accession']);
        var pedigree = SafePrint(plot['rows'][r]['material']['pedigree']);
        rowsInfoarray.push('<tr>');
        rowsInfoarray.push('<td style="background-color:' + color + '">' + SafePrint(replicate_index) + '</td>');
        rowsInfoarray.push('<td>' + SafePrint(plot['rows'][r]['rack_index']) + '</td>');
        rowsInfoarray.push('<td>' + accession + '</td>');
        rowsInfoarray.push('<td>' + pedigree + '</td>');
        rowsInfoarray.push('<td><a class="newstyle_link" target="_blank" href="' + SafePrint(plot['rows'][r]['material']['gene_bank']['so:url']) + '">' + SafePrint(plot['rows'][r]['material']['gene_bank']['so:name']) + '</a></td>');
        rowsInfoarray.push('<td id="' + random_id + '"></td>');
        rowsInfoarray.push('<tr>');
        get_GRU_by_accession(accession, plotId, random_id);

        if (plot['rows'][r]['observations'] != undefined) {
            for (o = 0; o < plot['rows'][r]['observations'].length; o++) {
                var observation = plot['rows'][r]['observations'][o];

                phenotypearray.push('<tr>');
                phenotypearray.push('<td style="background-color:' + color + '">' + SafePrint(replicate_index) + '</td>');
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
    rowsInfoarray.push('</tbody></table>');
    phenotypearray.push('</tbody></table>');
    htmlarray.push('Row: ' + plot['row_index'] + '<br/>');
    htmlarray.push('Column: ' + plot['column_index'] + '<br/>');
    htmlarray.push('Length: ' + plot['length'] + 'm<br/>');
    htmlarray.push('Width: ' + plot['width'] + 'm<br/>');
    htmlarray.push('Trial Design: ' + SafePrint(plot['trial_desgin']) + '<br/>');
    htmlarray.push('Sowing Date: ' + SafePrint(plot['sowing_date']) + '<br/>');
    htmlarray.push('Harvest Date: ' + SafePrint(plot['harvest_date']) + '<br/>');
    htmlarray.push('<hr/>');
    htmlarray.push(rowsInfoarray.join(""));
    htmlarray.push('<hr/>');
    htmlarray.push('<h5>Phenotype</h5>');
    htmlarray.push(phenotypearray.join(""));

    return htmlarray.join("");


}

// function get_GRU_by_accession(accession) {
function get_GRU_by_accession(accession, plotId, id) {
    $.ajax({
        type: "GET",
        url: '/seedstor/apisearch-unified.php?query=' + accession,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (gru_json) {
            var links = format_gru_json(gru_json);
            var linksjson = {};
            linksjson['plotId'] = plotId;
            linksjson['id'] = id;
            linksjson['links'] = links;
            plotsGRUArray.push(linksjson);
        }
    });
}


// }

function format_gru_json(gru_json) {
    var htmlarray = [];
    if (gru_json != undefined && gru_json.length > 0) {
        // for (i = 0; i < gru_json.length; i++) {
        if (gru_json.length > 0) {
            if (gru_json[0]['idPlant'] != undefined) {

                var idPlant = gru_json[i]['idPlant'];
                // htmlarray.push(idPlant);
                htmlarray.push('<a target="_blank" class="newstyle_link" href="https://seedstor.ac.uk/search-infoaccession.php?idPlant=' + idPlant + '">Plant ' + idPlant + '</a> ');
            }
        }
    }
    // }
    return htmlarray.join('');
}

/**
 * Get empty strings instead of undefeined variables
 *
 * @param obj The object to check.
 */
function SafePrint(obj) {
    if (obj === undefined) {
        return "";
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
                        "param": "Search Studies",
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
                        "param": "FT Facet",
                        "current_value": "Field Trial"
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
                            "param": "FT Facet",
                            "current_value": "Field Trial"
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




