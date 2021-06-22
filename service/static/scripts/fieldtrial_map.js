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
var type_param_global = '';

var datemin = 0;
var datemax = 0;

/**
 * Start field trial map and table
 *
 * @param {JSONArray} jsonArray - JSONArray from backend containing all field trial info.
 * @param {string} type_param - type of the display, can be Grassroots:FieldTrial, Grassroots:Study or AllFieldTrials.
 */
function startFieldTrialGIS(jsonArray, type_param) {
    type_param_global = type_param;
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
    if (type_param === 'Grassroots:Study') {
        let experimental_area_json = jsonArray[0]['data'];
        jQuery('#tableWrapper').html('<br/><br/>' + create_study_info_html(experimental_area_json));
        $('.table').DataTable({
            "ordering": false,
            "paging": false,
            "searching": false,
            "info": false
        });
        formatted_treatments = generate_treatments_html(experimental_area_json);
        if (experimental_area_json['plots'] !== undefined && experimental_area_json['plots'] !== null) {
            for (j = 0; j < experimental_area_json['plots'].length; j++) {
                let plot = experimental_area_json['plots'][j];
                if (plot['rows'].length > 0) {
                    if (plot['rows'][0]['study_index'] !== undefined) {
                        let plotId = plot['rows'][0]['study_index'];
                        plotsModalInfo[plotId] = formatPlotModal(plot);
                        // show other plots info, but performance issue
                        // for (j = 0; j < plot_json.length; j++) {
                        //     const loop_plotId = plot_json[j]['_id']['$oid'];
                        //     if (loop_plotId !== plotId) {
                        //         var rows = plot_json[j]['rows'];
                        //         for (jr = 0; jr < rows.length; jr++) {
                        //             var accession = rows[jr]['material']['accession'];
                        //             if (accession != undefined) {
                        //                 if (searchStr === accession && searchStr !== '') {
                        //                     let formatted_plot = format_plot_rows(plot_json[j], true);
                        //                     $('#rowsInfo').append(formatted_plot['rowsInfo'].join(""));
                        //                     $('#phenotypes').append(formatted_plot['phenotypes'].join(""));
                        //                     break;
                        //                 }
                        //             }
                        //         }
                        //     }
                        //
                        // }
                    }
                }
            }
        }


    } else {
        produceFieldtrialTable(filtered_data_without_location.concat(filtered_data_with_location), type_param);

    }

    displayFTLocations(filtered_data_with_location, type_param);
    if (type_param !== 'AllFieldTrials') {
        create_study_modal_html(filtered_data_without_location.concat(filtered_data_with_location));
    }
    $('#download_question').popover({
        content: 'Frictionless Data Package lets you download all data associated with this study, including its parent field trial and programme, for more info and the tool go to <a class="newstyle_link" href="https://grassroots.tools/frictionless-data/grassroots-fd-client.md" target="_blank">here</a>',
        html: true,
        placement: 'top',
        trigger: 'manual',
        // delay: {
        //     show: "0",
        //     hide: "5000"
        // },
        animation: false
    });
    //     .on("mouseenter", function () {
    //     var _this = this;
    //     $(this).popover("show");
    //     $("#download_question").on("mouseleave", function () {
    //         $(_this).popover('hide');
    //     });
    // }).on("mouseleave", function () {
    //     var _this = this;
    //     setTimeout(function () {
    //         if (!$("#download_question:hover").length) {
    //             $(_this).popover("hide");
    //         }
    //     }, 300);
    // });
    $('#download_question').on('mouseenter', function () {
        $(this).popover('toggle');
    });
    // $('#download_question').on('mouseover', function () {
    //     $(this).popover('show');
    // });
}

/**
 * Create field trial DataTable
 *
 * @param {JSONArray} data - JSONArray from backend containing all field trial info.
 * @param {string} type_param - type of the display, can be Grassroots:FieldTrial, Grassroots:Study or AllFieldTrials.
 */
function produceFieldtrialTable(data, type_param) {
    // yrtable.destroy();
    yrtable = jQuery('#resultTable').DataTable({
        data: data,
        "ordering": false,
        "scrollX": true,
        // initComplete: function () {
        //     this.api().columns().every( function () {
        //         var column = this;
        //         var select = $('<select><option value=""></option></select>')
        //             .appendTo( $(column.footer()).empty() )
        //             .on( 'change', function () {
        //                 var val = $.fn.dataTable.util.escapeRegex(
        //                     $(this).val()
        //                 );
        //
        //                 column
        //                     .search( val ? '^'+val+'$' : '', true, false )
        //                     .draw();
        //             } );
        //
        //         column.data().unique().sort().each( function ( d, j ) {
        //             select.append( '<option value="'+d+'">'+d+'</option>' )
        //         } );
        //     } );
        // },
        "columns": [
            {
                title: "Programme",
                "render": function (data, type, full, meta) {

                    return format_study_parent_program(full);
                }
            },
            {
                title: "Field Trial",
                "render": function (data, type, full, meta) {
                    var ft_name = SafePrint(full['parent_field_trial']['so:name']);
                    if (full['parent_field_trial'] !== undefined) {
                        var ftId = full['parent_field_trial']['_id']['$oid'];
                        ft_name = '<a href="' + root_dir + 'fieldtrial/' + ftId + '" target="_blank">' + full['parent_field_trial']['so:name'] + '</a>';
                    }
                    return ft_name;
                }
            },
            {
                title: "Study",
                "render": function (data, type, full, meta) {
                    var studyId = full['_id']['$oid'];
                    let study_result = '<a href="' + root_dir + 'fieldtrial/study/' + studyId + '" target="_blank">' + full['so:name'] + '</a>';

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
                title: "Sowing Year",
                "render": function (data, type, full, meta) {
                    if (full['sowing_year'] != undefined) {
                        return full['sowing_year'];
                    } else {
                        return '';
                    }
                }
            },
            {
                title: "Harvest Year",
                "render": function (data, type, full, meta) {
                    if (full['harvest_year'] != undefined) {
                        return full['harvest_year'];
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
                    // var studyId = full['_id']['$oid'];
                    // var treatment = '';
                    // if (full['treatment_factors'] !== undefined && full['treatment_factors'] !== null && type_param !== 'AllFieldTrials') {
                    //     if (full['treatment_factors'].length > 0) {
                    //         treatment = '<span style="cursor:pointer;" class="newstyle_link" onclick="plotModal(\'' + studyId + 'treatment\')">Treatment Factors</span>'
                    //     }
                    // }
                    // return '<ul><li><span style="cursor:pointer;" class="newstyle_link" onclick="plotModal(\'' + studyId + '\')">Study Info</span></li>' + treatment + '</ul>';
                    return format_study_treatment_facotrs_link(full);
                }
            }
            ,
            {
                title: "Contacts",
                "render": function (data, type, full, meta) {
                    // var study_result = '';
                    return format_study_contacts(full);
                    // if (full['curator'] !== undefined) {
                    //     let curator_name = full['curator']['so:name'];
                    //     if (full['curator']['so:email'] !== undefined) {
                    //         let curator_email = full['curator']['so:email'];
                    //         study_result = study_result + 'Curator: <a href="mailto:' + curator_email + '" target="_blank">' + curator_name + '</a>';
                    //     } else {
                    //         study_result = study_result + 'Curator: ' + curator_name;
                    //     }
                    // }
                    // if (full['contact'] !== undefined) {
                    //     let contact_name = full['contact']['so:name'];
                    //     if (full['contact']['so:email'] !== undefined) {
                    //         let contact_email = full['contact']['so:email'];
                    //         study_result = study_result + '<br/>Contact: <a href="mailto:' + contact_email + '" target="_blank">' + contact_name + '</a>';
                    //     } else {
                    //         study_result = study_result + '<br/>Contact: ' + contact_name;
                    //     }
                    // }
                    // return study_result;
                }
            },
            {
                title: 'Download<i id="download_question" class="fas fa-question newstyle_link"></i>',
                "render": function (data, type, full, meta) {
                    var download = '';
                    if (full['so:contentUrl'] !== undefined) {
                        var link = full['so:contentUrl'];
                        download = '<a  class="newstyle_link" target="_blank" href="' + link + '" download>Frictionless Data Package</a>'
                    }
                    return download;
                }
            }

        ]

    });

    // $('#resultTable tfoot tr').insertAfter($('#resultTable thead tr'));

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

            // let shape_data = JSON.parse(json['shape_data']);
            let shape_data = json['shape_data'];
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
        //     console.log("server search here");
        // jQuery('#resultTable').on('search.dt', function () {
        //     removePointers();
        //     var search_value = $('.dataTables_filter input').val();
        //     var req_json = CreatePlotsRequestForAllFieldTrials(search_value);
        //
        //     console.log("server search query " + JSON.stringify(req_json));
        //
        //     if (req_json) {
        //         $.ajax({
        //             type: "POST",
        //             headers: {
        //                 'X-CSRFToken': csrftoken
        //             },
        //             url: '/fieldtrial/ajax/get_fieldtrial/',
        //             data: {'search_str': search_value},
        //             dataType: "json",
        //             contentType: "application/json; charset=utf-8"
        //         }).done(function (ft_json) {
        //             console.log("server search response " + JSON.stringify(ft_json));
        //             if (ft_json['results'][0]['results'] != undefined) {
        //
        //                 // yrtable.destroy();
        //                 $('#tableWrapper').html('  <div id="tableWrapper">\n' +
        //                     '            <table id="resultTable"></table>\n' +
        //                     '        </div>');
        //                 startFieldTrialGIS(ft_json['results'][0]['results'], type_param);
        //                 $('.dataTables_filter input').val(search_value);
        //             }
        //         }).fail(function (req, status, error) {
        //             console.info("req " + "status " + status + " error " + error);
        //         });
        //     }
        //
        //
        // });
    }
    // else {
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

    // }

    jQuery("#slider").bind("valuesChanging", function (e, data) {
        datemin = data.values.min;
        datemax = data.values.max;

        yrtable.draw();
    });

    jQuery.fn.dataTableExt.afnFiltering.push(
        function (oSettings, aData, iDataIndex) {
            var dateStart = datemin;
            var dateEnd = datemax;

            var evalDate = aData[6];

            if (((evalDate >= dateStart && evalDate <= dateEnd) || (evalDate >= dateStart && dateEnd == 0)
                || (evalDate >= dateEnd && dateStart == 0)) || (dateStart == 0 && dateEnd == 0)) {
                return true;
            } else {
                return false;
            }

        });

    // jQuery.fn.dataTableExt.afnFiltering.push(
    // function (oSettings, aData, iDataIndex) {
    //     var dateStart = datemin;
    //     var dateEnd = datemax;
    //
    //     var evalDate = Date.parse(aData[6]);
    //
    //     if (((evalDate >= dateStart && evalDate <= dateEnd) || (evalDate >= dateStart && dateEnd == 0)
    //         || (evalDate >= dateEnd && dateStart == 0)) || (dateStart == 0 && dateEnd == 0)) {
    //         return true;
    //     }
    //     else {
    //         return false;
    //     }
    //
    // });

}


/**
 * Get study address and return formatted string
 *
 * @param {JSON} full - Study JSON.
 * @param {bool} link_bool - Boolean to make returned text formatted as a link with styling.
 */
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


/**
 * Create study plots page link, if no plots it will return an empty string
 *
 * @param {JSON} full - Study JSON.
 */
function get_study_plots_link(full) {
    if (check_plots(full)) {
        var id = full['_id']['$oid'];

        /* remove the quotes */
        id = id.replace(/"/g, "");

        return '<a class=\"newstyle_link\" href=\"' + root_dir + 'fieldtrial/plots/' + id + '\"  target=\"_blank\">View plots</a>';
    } else {
        return '';
    }
}

/**
 * Check if study has plots, return a boolean
 *
 * @param {JSON} full - Study JSON.
 */
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

/**
 * Create modal html and stored in plotsModalInfo global var.
 *
 * @param {JSONArray} array - JSONArray of studies.
 */
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

/**
 * Format programme info for a given study
 *
 * @param {JSON} full - Study JSON.
 */
function format_study_parent_program(full) {
    let result = '';
    if (full['parent_program'] !== undefined && full['parent_program'] !== null) {
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

/**
 * Format both contact and curator info for a given study
 *
 * @param {JSON} full - Study JSON.
 */
function format_study_contacts(full) {
    var curator = format_study_curator(full);
    var contact = format_study_contact(full);

    if (curator !== '') {
        curator = 'Curator: ' + curator;
    }

    if (contact !== '') {
        contact = 'Contact: ' + contact;
    }

    return curator + '<br/>' + contact;
}

/**
 * Format curator info for a given study
 *
 * @param {JSON} full - Study JSON.
 */
function format_study_curator(full) {
    var study_result = '';
    if (full['curator'] !== undefined && full['curator'] !== null) {
        let curator_name = full['curator']['so:name'];
        if (full['curator']['so:email'] !== undefined && full['curator']['so:email'] !== null) {
            let curator_email = full['curator']['so:email'];
            study_result = '<a href="mailto:' + curator_email + '" target="_blank">' + SafePrint(curator_name) + '</a>';
        } else {
            study_result = SafePrint(curator_name);
        }

    }
    return study_result;

}

/**
 * Format contacts info for a given study
 *
 * @param {JSON} full - Study JSON.
 */
function format_study_contact(full) {
    var study_result = '';
    if (full['contact'] !== undefined && full['contact'] !== null) {
        let contact_name = full['contact']['so:name'];
        if (full['contact']['so:email'] !== undefined && full['contact']['so:email'] !== null) {
            let contact_email = full['contact']['so:email'];
            study_result = '<a href="mailto:' + contact_email + '" target="_blank">' + SafePrint(contact_name) + '</a>';
        } else {
            study_result = SafePrint(contact_name);
        }
    }
    return study_result;

}

/**
 * Format treatments link info for a given study
 *
 * @param {JSON} full - Study JSON.
 */
function format_study_treatment_facotrs_link(full) {
    var studyId = full['_id']['$oid'];
    var treatment = '';
    if (full['treatment_factors'] !== undefined && full['treatment_factors'] !== null && type_param_global !== 'AllFieldTrials') {
        if (full['treatment_factors'].length > 0) {
            treatment = '<span style="cursor:pointer;" class="newstyle_link" onclick="plotModal(\'' + studyId + 'treatment\')">Treatment Factors</span>'
        }
    }
    return treatment;
}

/**
 * Format crop info for a given study
 *
 * @param {JSON} crop_json - Study crop JSON.
 */
function format_crop(crop_json) {
    var crop = '';
    if (crop_json !== undefined && crop_json !== null) {
        if (crop_json['so:name'] !== undefined) {
            crop = crop_json['so:name'];
            if (crop_json['so:url'] !== undefined) {
                crop = '<a href="' + crop_json['so:url'] + '" target="_blank">' + crop_json['so:name'] + '</a>';
            }
        }
    }
    return crop;
}

/**
 * Format all info for a given study into a table, this is used in the study page and map marker popup info
 *
 * @param {JSON} studyJson - Study JSON.
 */
function create_study_info_html(studyJson) {
    var htmlarray = [];
    htmlarray.push('<table class="table table-bordered">');
    htmlarray.push('<thead>');

    htmlarray.push('<tr>');
    htmlarray.push('<th width="50%">');
    htmlarray.push('<b>Study Info</b> ');
    htmlarray.push('</th>');
    htmlarray.push('<th width="50%">');
    htmlarray.push('<b>Values</b> ');
    htmlarray.push('</th>');
    htmlarray.push('</tr>');
    htmlarray.push('<thead>');
    htmlarray.push('<tbody>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Study Name:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(studyJson['so:name']);
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Study Description:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(studyJson['so:description']);
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    if (studyJson["parent_program"] !== undefined) {


        htmlarray.push('<tr>');
        htmlarray.push('<td>');
        htmlarray.push('<b>Programme:</b> ');
        htmlarray.push('</td>');
        htmlarray.push('<td>');
        htmlarray.push(format_study_parent_program(studyJson));
        htmlarray.push('</td>');
        htmlarray.push('</tr>');
    }

    if (studyJson["parent_field_trial"] !== undefined) {
        var ftId = studyJson['parent_field_trial']['_id']['$oid'];
        var ft_name = '<a target="_blank" style="newstyle_link" href="' + root_dir + 'fieldtrial/' + ftId + '" target="_blank">' + studyJson['parent_field_trial']['so:name'] + '</a>';
        htmlarray.push('<tr>');
        htmlarray.push('<td>');
        htmlarray.push('<b>Field Trial Name:</b> ');
        htmlarray.push('</td>');
        htmlarray.push('<td>');
        htmlarray.push(ft_name);
        htmlarray.push('</td>');
        htmlarray.push('</tr>');
    }

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Study Design:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(SafePrint(studyJson['study_design']));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Team:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(SafePrint(studyJson["parent_field_trial"]['team']));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');


    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Phenotype Gathering Notes:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(SafePrint(studyJson['phenotype_gathering_notes']));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Slope:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(SafePrint(studyJson['envo:00002000']));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Aspect:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(SafePrint(studyJson['ncit:C42677']));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Weather:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(SafePrint(studyJson['weather']));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    if (studyJson['current_crop'] !== undefined) {
        htmlarray.push('<tr>');
        htmlarray.push('<td>');
        htmlarray.push('<b>Current Crop:</b> ');
        htmlarray.push('</td>');
        htmlarray.push('<td>');
        htmlarray.push(format_crop(studyJson['current_crop']));
        htmlarray.push('</td>');
        htmlarray.push('</tr>');
    }

    if (studyJson['previous_crop'] !== undefined) {
        htmlarray.push('<tr>');
        htmlarray.push('<td>');
        htmlarray.push('<b>Previous Crop:</b> ');
        htmlarray.push('</td>');
        htmlarray.push('<td>');
        htmlarray.push(format_crop(studyJson['previous_crop']));
        htmlarray.push('</td>');
        htmlarray.push('</tr>');
    }

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Sowing Year:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(SafePrint(studyJson['sowing_year']));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Harvest Year:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(SafePrint(studyJson['harvest_year']));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Plots:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(get_study_plots_link(studyJson));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Address:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(get_study_address(studyJson, false));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Treatment Factors:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(format_study_treatment_facotrs_link(studyJson));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Curator:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(format_study_curator(studyJson));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    htmlarray.push('<tr>');
    htmlarray.push('<td>');
    htmlarray.push('<b>Contact:</b> ');
    htmlarray.push('</td>');
    htmlarray.push('<td>');
    htmlarray.push(format_study_contact(studyJson));
    htmlarray.push('</td>');
    htmlarray.push('</tr>');

    if (studyJson['so:url'] !== undefined && studyJson['so:url'] !== null) {
        htmlarray.push('<tr>');
        htmlarray.push('<td>');
        htmlarray.push('<b>More info:</b> ');
        htmlarray.push('</td>');
        htmlarray.push('<td>');
        htmlarray.push('<a href="' + studyJson['so:url'] + '" target="_blank" style="newstyle_link">link</a>');
        htmlarray.push('</td>');
        htmlarray.push('</tr>');
    }

    if (studyJson['so:contentUrl'] !== undefined) {
        htmlarray.push('<tr>');
        htmlarray.push('<td>');
        htmlarray.push('<b>Download <i id="download_question" class="fas fa-question newstyle_link"></i>:</b> ');
        htmlarray.push('</td>');
        htmlarray.push('<td>');
        htmlarray.push('<a href="' + studyJson['so:contentUrl'] + '" target="_blank" style="newstyle_link" download>Frictionless Data Package</a>');
        htmlarray.push('</td>');
        htmlarray.push('</tr>');
    }

    htmlarray.push('</tbody>');
    htmlarray.push('</table>');

    htmlarray.push('<hr/>');
    return htmlarray.join("");

}


/**
 * Remove all markers and geoJSON on the map
 *
 */
function removePointers() {
    map.removeLayer(markersGroup2);
    markersGroup2 = new L.MarkerClusterGroup();
}


/**
 * Display all field trials on the map
 *
 * @param {JSONArray} array - JSONArray from backend containing all field tria (with locations) info.
 * @param {string} type_param - type of the display, can be Grassroots:FieldTrial, Grassroots:Study or AllFieldTrials.
 */
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
            // let geo_json = JSON.parse(array[i]['shape_data']);
            let geo_json = array[i]['shape_data'];
            var shape_layer = L.geoJson(geo_json);
            markersGroup2.addLayer(shape_layer);
            var layerGroup = L.geoJson(geo_json, {
                onEachFeature: function (feature, layer) {
                    var plotId = feature.properties['plot_id'];
                    var popupContent = 'Study: ' + SafePrint(geo_json['name']) + '<br/>Plot ID: ' + SafePrint(feature.properties['plot_id']);
                    if (type_param_global === 'Grassroots:Study' && plotsModalInfo[plotId] !== undefined) {
                        var popupContent = plotsModalInfo[plotId];
                    }
                    layer.bindPopup(popupContent, {maxWidth: 800, maxHeight: 400});
                    // layer.bindPopup('<p>Plot No.:</p>');
                }
            });
            markersGroup2.addLayer(layerGroup);
        }
        // }
    }
    map.addLayer(markersGroup2);


}

/**
 * Display colorbox of a given plot
 *
 * @param {string} id - id of the plot.
 */
function plot_colorbox(id) {
    var plot_data = plotsHTMLArray[id];

    // $('#modal-body').html(plot_data);
    $.colorbox({width: "80%", html: plot_data});
    // $('#plotModal').modal('show');
}


/**
 * Add a pointer to the map
 *
 * @param {string} la - latitude of the pointer.
 * @param {string} lo - longitude of the pointer.
 * @param {string} note - popup notes of the pointer.
 */
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
    var popup = L.popup({maxHeight: 400}).setContent(note);
    markerLayer = L.marker([la, lo]).bindPopup(popup).openPopup();
    markersGroup2.addLayer(markerLayer);

}

/**
 * Format a given plot and stored in the plotsModalInfo global var
 *
 * @param {JSON} plot - JSON of the give plot.
 * @param {string} plot_block_rows - number of rows in block.
 * @param {string} plot_block_columns - number of columns in block.
 */
function formatPlot(plot, plot_block_rows, plot_block_columns) {
    let plotId = plot['_id']['$oid'];
    let current_row = parseInt(plot['row_index']);
    let current_column = parseInt(plot['column_index']);
    let accession = "";
    for (r = 0; r < plot['rows'].length; r++) {
        accession += " " + plot['rows'][r]['material']['accession'];
    }
    var color;
    color = '#ABEBC6';
    plotsModalInfo[plotId] = formatPlotModal(plot);
    let padding = plot_gap_calculator(current_column, current_row, plot_block_columns, plot_block_rows);
    return '<td style="' + padding + '"><div class="plot" id="' + plotId + '" style="padding:5px; cursor:pointer; font-size: 0.8rem;  background-color:' + color + '" onclick="plotModal(\'' + plotId + '\')">Row:' + current_row + ' Column:' + current_column + '</div></td>';
}

/**
 * Calculate gaps in the plot view
 *
 * @param {string} current_column - current number of column.
 * @param {string} current_row - current number of row.
 * @param {string} plot_block_rows - number of rows in block.
 * @param {string} plot_block_columns - number of columns in block.
 */
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


/**
 * Display plot modal with a given id
 *
 * @param {string} plotId - Plot id.
 */
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

    // $('#plots_table_rows').DataTable();
    $('#plots_table').DataTable({
        "paging": false
    });

}

/**
 * Format plot modal in html
 *
 * @param {JSON} plot - Plot JSON.
 */
function formatPlotModal(plot) {

    let htmlarray = [];
    let phenotypearray = [];
    let rowsInfoarray = [];

    let plot_actual_id = '';

    if (plot['rows'][0]['study_index'] !== undefined) {
        plot_actual_id = plot['rows'][0]['study_index'];
    }

    rowsInfoarray.push('<table class="table racks" id="plots_table_rows"><thead><tr><th>Replicate</th><th>Rack</th><th>Accession</th><th>Pedigree</th><th>Gene Bank</th><th>Links</th><th>Treatments</th></tr></thead><tbody id="rowsInfo">');
    phenotypearray.push('<table class="table plots" id="plots_table"><thead><tr><th>Replicate</th><th>Rack</th><th>Date</th><th>Raw Value</th><th>Corrected Value</th><th>Trait</th><th>Measurement</th><th>Unit</th></tr></thead><tbody id="phenotypes">');

    let formatted_plot = format_plot_rows(plot, false);

    rowsInfoarray = rowsInfoarray.concat(formatted_plot['rowsInfo']);
    phenotypearray = phenotypearray.concat(formatted_plot['phenotypes']);

    rowsInfoarray.push('</tbody></table>');
    phenotypearray.push('</tbody></table>');
    htmlarray.push('<div class="row justify-content-between">');
    htmlarray.push('<div class="col-4">');
    htmlarray.push('Plot ID: ' + plot_actual_id + '<br/>');
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

/**
 * Format plot rows
 *
 * @param {JSON} plot - Plot JSON.
 * @param {Boolean} replicate_bool - Boolean if it is a replicate.
 */
function format_plot_rows(plot, replicate_bool) {
    let plotId = plot['_id']['$oid'];

    let plot_actual_id = '';

    if (plot['rows'][0]['study_index'] !== undefined) {
        plot_actual_id = plot['rows'][0]['study_index'];
    }
    let formatted_plot = {};
    let phenotypearray = [];
    let rowsInfoarray = [];
    // rowsInfoarray.push('<table class="table racks"><thead><tr><th>Replicate</th><th>Rack</th><th>Accession</th><th>Pedigree</th><th>Gene Bank</th><th>Links</th></tr></thead><tbody>');
    // phenotypearray.push('<table class="table plots"><thead><tr><th>Replicate</th><th>Rack</th><th>Date</th><th>Raw Value</th><th>Corrected Value</th><th>Trait</th><th>Measurement</th><th>Unit</th></tr></thead><tbody>');
    let replicate = ' ' + plot_actual_id + ' (Current Plot)';
    if (replicate_bool) {
        replicate = ' <u style="cursor:pointer;" onclick="plotModal(\'' + plotId + '\')">(Plot ' + plot_actual_id + ' Row:' + plot['row_index'] + ' - Col:' + plot['column_index'] + ')</u>';
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


/**
 * Format treatments
 *
 * @param {JSONArray} treatments - Treatment JSONArray.
 */
function format_plot_treatment(treatments) {
    let htmlarray = [];
    for (i = 0; i < treatments.length; i++) {
        htmlarray.push(treatments[i]['so:sameAs'] + ' - ' + treatments[i]['label']);
        htmlarray.push('<br/>');
    }
    return htmlarray.join(' ');
}


/**
 * Query SeedStor API given an accession
 *
 * @param {String} accession - Accession name.
 * @param {String} plotId - Plot id.
 * @param {String} r - replicate number.
 */
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


/**
 * Format SeedStor GRU JSON into html
 *
 * @param {String} gru_json - GRU returned JSON.
 */
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
 * @param {JSONObject} obj - The object to check.
 */
function SafePrint(obj) {
    if (obj === undefined || obj === null) {
        return "";
    } else {
        return obj;
    }
}

/**
 * Return defined string instead of undefeined variables
 *
 * @param {JSONObject} obj - The object to check.
 * @param {String} value - Display value if null or undefined.
 */
function SafePrint_with_value(obj, value) {
    if (obj === undefined || obj === null) {
        return value;
        console.log(value);
    } else {
        return obj;
    }
}


/**
 * Create request JSON to send to the apache backend for a given study id
 *
 * @param {String} exp_area_id - Study id.
 */
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

/**
 * Create request JSON to send to the apache backend for a given field trial id
 *
 * @param {String} fieldtrial_id - Study id.
 */
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

/**
 * Create request JSON to send to the apache backend for a given string
 *
 * @param {String} keyword - Search string.
 */
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

/**
 * Create Plots table
 *
 * @param {JSON} experimental_area_json - Study JSON.
 */
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

/**
 * Create Plots table elements
 *
 * @param {JSON} experimental_area_json - Study JSON.
 */
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

/**
 * Create Treatments table
 *
 * @param {JSON} experimental_area_json - Study JSON.
 */
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

/**
 * Search plots accessions with a given string from the page form input
 *
 */
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




