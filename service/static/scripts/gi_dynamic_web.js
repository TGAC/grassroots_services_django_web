var linked_services_global = {};
var textareas = [];
var synchronous = false;
var repeatable_groups = {};
var datatable_param_list = [];
var fieldTrailSearchType = '';
var level_simpleoradvanced = "simple";

function get_all_services_as_table() {

    // $('#form').html("<table id=\"listTable\">Loading services...</table>");

    $.ajax({
        url: server_url,
        data: services,
        type: "POST",
        dataType: "json",
        success: function (json) {
            console.info(JSON.stringify(json));
            // var list_html = [];
            // list_html.push('<h3>Click any of the service to load the form</h3>');
            // list_html.push('<ul>');
            // for (var j = 0; j < json['services'].length; j++) {
            //     var service_name = json['services'][j]['service_name'];
            //     var icon_uri = json['services'][j]['operations']['icon_uri'];
            //     list_html.push('<li class="newstyle_link" onclick="populateService(\'' + service_name + '\')"><img src="' + icon_uri + '"/><u>' + service_name + '</u></li>');
            // }
            // list_html.push('</ul>');
            // $('#form').html(list_html.join(' '));
            var context_json = json['@context'];
            var listTable = jQuery('#listTable').DataTable({
                data: json['services'],
                searchHighlight: true,
                scrollX: true,
                scrollCollapse: true,
                "columns": [
                    {
                        title: "Service",
                        "render": function (data, type, full, meta) {
                            // return '<div class="newstyle_link" onclick="populateService(\'' + full['so:name'] + '\')"><img src="' + full['operations']['so:image'] + '"/> <u>' + full['so:name'] + '</u></div>';
                            return '<a class="newstyle_link" href="' + full['so:name'] + '"><img src="' + full['operation']['so:image'] + '"/> <u>' + full['so:name'] + '</u></a>';
                        }
                    },
                    {data: "so:description", title: "Description", "sDefaultContent": ""},
                    {
                        title: "Provider",
                        "render": function (data, type, full, meta) {
                            var provider_html = [];
                            provider_html.push('<ul class="list_service_table_ul">');
                            if (full['provider'] != undefined) {
                                var this_provider = full['provider'];
                                provider_html.push('<li title="' + this_provider['so:description'] + '"><img src="' + this_provider['so:logo'] + '" height="20px"/><a target="_blank" href="' + this_provider['so:url'] + '" class="newstyle_link" >' + this_provider['so:name'] + '</a></li>');

                            } else if (full['providers'] != undefined) {
                                for (var proi = 0; proi < full['providers'].length; proi++) {
                                    var this_provider = full['providers'][proi];
                                    provider_html.push('<li title="' + this_provider['so:description'] + '"><img src="' + this_provider['so:logo'] + '" height="20px"/><a target="_blank" href="' + this_provider['so:url'] + '" class="newstyle_link" >' + this_provider['so:name'] + '</a></li>');
                                }
                            }
                            provider_html.push('</ul>');
                            return provider_html.join(' ');
                        }
                    },
                    {
                        title: "Application Category",
                        "render": function (data, type, full, meta) {
                            return '<div title="' + full['category']['application_category']['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, full['category']['application_category']['so:sameAs']) + '" class="newstyle_link">' + full['category']['application_category']['so:name'] + '</a></div>';
                        }
                    },
                    {
                        title: "Application Sub-Category",
                        "render": function (data, type, full, meta) {
                            if (full['category']['application_subcategory'] != undefined) {
                                return '<div title="' + full['category']['application_subcategory']['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, full['category']['application_subcategory']['so:sameAs']) + '" class="newstyle_link">' + full['category']['application_subcategory']['so:name'] + '</a></div>';

                            } else {
                                return '';
                            }
                        }
                    },
                    {
                        title: "Input",
                        "render": function (data, type, full, meta) {
                            var input_html = [];
                            input_html.push('<ul class="list_service_table_ul">');
                            for (var ini = 0; ini < full['category']['input'].length; ini++) {
                                var this_input = full['category']['input'][ini];
                                input_html.push('<li title="' + this_input['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, this_input['so:sameAs']) + '">' + this_input['so:name'] + '</a></li>');
                            }
                            input_html.push('</ul>');
                            return input_html.join(' ');
                        }
                    },
                    {
                        title: "Output",
                        "render": function (data, type, full, meta) {
                            var output_html = [];
                            output_html.push('<ul class="list_service_table_ul">');
                            for (var outi = 0; outi < full['category']['output'].length; outi++) {
                                var this_output = full['category']['output'][outi];
                                output_html.push('<li title="' + this_output['so:description'] + '"><a target="_blank" href="' + ontology_links(context_json, this_output['so:sameAs']) + '">' + this_output['so:name'] + '</a></li>');
                            }
                            output_html.push('</ul>');
                            return output_html.join(' ');
                        }
                    }


                ]
            });
            // listTable.row.add([
            //     '<a class="newstyle_link" href="/service/Search%20Treatment"><img src="https://grassroots.tools/grassroots-test/5/images/polygonchange"> <u>Search Treatment</u></a>',
            //     'Search field trial treatment',
            //     '',
            //     '',
            //     '',
            //     'Keyword',
            //     'Treatment'
            // ]).draw(false);
        }
    });

    $('#back_link').css('visibility', 'hidden');
}

function ontology_links(context_json, ontology_ref) {
    var ontology_array = ontology_ref.split(':');
    var prefix = ontology_array[0] + ':';
    // console.log(prefix);
    return context_json[prefix] + ontology_array[1];
}

// //deprecated
// function get_all_services() {
//     $('#form').html("Getting service...");
//     $.ajax({
//         url: server_url,
//         data: services,
//         type: "POST",
//         dataType: "json",
//         success: function (json) {
//             console.info(JSON.stringify(json));
//             var list_html = [];
//             list_html.push('<h3>Click any of the service to load the form</h3>');
//             list_html.push('<ul>');
//             for (var j = 0; j < json['services'].length; j++) {
//                 var service_name = json['services'][j]['so:name'];
//                 var icon_uri = json['services'][j]['operations']['icon_uri'];
//                 list_html.push('<li class="newstyle_link" onclick="populateService(\'' + service_name + '\')"><img src="' + icon_uri + '"/><u>' + service_name + '</u></li>');
//             }
//             list_html.push('</ul>');
//             $('#form').html(list_html.join(' '));
//         }
//     });
// }

function populateService(service_name) {
    $('#back_link').css('visibility', 'visible');
    // $('#title').html('Search Treatment');
    // $('#description').html('Search field trial treatment');
    $('#simpleAdvanceWrapper').show();
    selected_service_name = service_name;
    if (selected_service_name === 'Search Treatment' || selected_service_name === 'SearchTreatment') {
        $('#title').html('Search Treatment');
        $('#description').html('Search field trial treatment');
        var form_html = [];

        // form_html.push('<p>Start searching by entering query into the search box and then click each result row to copy the variable name to you clipboard to paste into your field trail spreadsheet.</p>');
        form_html.push('<label title="Search the field trial data">Search treatment in the box below <i class="fas fa-arrow-right"></i>' +
            ' Click (Ctrl click to select multi-rows) result rows to copy it to clipboard <i class="fas fa-arrow-right"></i>' +
            ' Paste into your field trial spread sheet or export as excel.</label>');

        // ajax stuff here
        form_html.push('<input id="ft_ajax_search" type="text" class="form-control"  name="search_treatment_ajax" value="" onkeyup="do_ajax_search();"/>');
        form_html.push('<div id="ajax_result"></div>');
        form_html.push('</div>');
        $('#form').html(form_html.join(' '));

    } else {
        $.ajax({
            url: server_url,
            data: '{"services": [{"so:name":"' + service_name + '"}], "operations": {"operation": "get_named_service"}}',
            type: "POST",
            dataType: "json",
            success: function (json) {
                response = json;
                console.info(JSON.stringify(json));
                $('#title').html(response['services'][0]['so:name']);
                $('#description').html(response['services'][0]['so:description']);
                if (response['services'][0]['operation']['so:url'] != undefined) {
                    var infoLink = response['services'][0]['operation']['so:url'];
                    $('#moreinfo').html('For more information, go to <a href="' + infoLink + '" target="_blank">' + infoLink + '</a>');
                }
                parameters = response['services'][0]['operation']['parameter_set']['parameters'];
                groups = response['services'][0]['operation']['parameter_set']['groups'];
                synchronous = response['services'][0]['operation']['synchronous'];
                console.info('synchronous' + synchronous);
                produce_form('form', parameters, groups);
                simpleOrAdvanced('show_simple');
                for (var i = 0; i < textareas.length; i++) {
                    document.getElementById(textareas[i]).addEventListener('dragover', handleDragOver, false);
                    document.getElementById(textareas[i]).addEventListener('drop', handleFileSelect, false);
                }
                $('.datepicker').datepicker({dateFormat: 'yy-mm-dd'});
                for (var idt = 0; idt < datatable_param_list.length; idt++) {
                    var datatableId = datatable_param_list[idt]['table_id'];
                    $('#' + datatableId).DataTable({
                        scrollX: true,
                        "paging": false,
                        "aaSorting": []
                        // dom: '<lBr<t>ip>',
                        // buttons: [
                        //     {
                        //         text: 'Add Row',
                        //         action: function ( e, dt, node, config ) {
                        //             table_add_new_row(datatableId);
                        //         }
                        //     }
                        // ]
                    });
                    table_add_new_row(datatableId);

                    document.getElementById(datatableId + '^drop').addEventListener('dragover', handleDragOver, false);
                    document.getElementById(datatableId + '^drop').addEventListener('drop', handleXlsxFileSelect, false);
                }
            }
        });
    }
}

function produce_form(div, parameters, groups) {
    var form_html = [];
    if (groups.length > 0) {
        var parameters_added = [];
        for (var j = 0; j < groups.length; j++) {
            var group_level = 'all';
            if (groups[j]['level'] != undefined) {
                group_level = groups[j]['level'];
            }
            if (groups[j]['repeatable']) {
                var group_random_id = generate_random_id();
                // repeatable stuff here
                form_html.push('<fieldset class="' + group_level + '">');
                form_html.push('<legend class="' + group_level + '">' + groups[j]['so:name'] + ' <span class="glyphicon glyphicon-plus pull-right" onclick="add_group_parameter(\'' + group_random_id + '\')"></span></legend>');
                form_html.push('<div id="' + group_random_id + '">');

                var this_group = {};

                this_group['so:name'] = groups[j]['so:name'];
                this_group['counter'] = 0;

                // console.log(JSON.stringify(this_group));
                repeatable_groups[group_random_id] = this_group;
                var this_group_parameters = [];
                for (var i = 0; i < parameters.length; i++) {
                    if (groups[j]['so:name'] == parameters[i]['group']) {
                        form_html.push(produce_one_parameter_form(parameters[i], true, group_random_id));
                        parameters_added.push(parameters[i]['param']);
                        this_group_parameters.push(parameters[i]);
                    }
                }
                repeatable_groups[group_random_id]['parameters'] = this_group_parameters;
                // console.log(JSON.stringify(repeatable_groups));
                form_html.push('</div>');
                form_html.push('</fieldset>');
            } else {
                if (groups[j]['visible'] || groups[j]['visible'] == undefined) {
                    form_html.push('<fieldset class="' + group_level + '">');
                    form_html.push('<legend>' + groups[j]['so:name'] + '</legend>');
                    for (var i = 0; i < parameters.length; i++) {
                        if (groups[j]['so:name'] == parameters[i]['group']) {
                            form_html.push(produce_one_parameter_form(parameters[i], false, null));
                            parameters_added.push(parameters[i]['param']);
                        }
                    }
                    form_html.push('</fieldset>');
                } else {
                    var random_id = generate_random_id();
                    form_html.push('<fieldset class="' + group_level + '">');
                    form_html.push('<legend><a href="#' + random_id + '"  data-toggle="collapse">' + groups[j]['so:name'] + '</a></legend>');

                    form_html.push('<div id="' + random_id + '"  class="collapse">');
                    for (var i = 0; i < parameters.length; i++) {
                        if (groups[j]['so:name'] == parameters[i]['group']) {
                            form_html.push(produce_one_parameter_form(parameters[i], false, null));
                            parameters_added.push(parameters[i]['param']);
                        }
                    }
                    form_html.push('</div>');
                    form_html.push('</fieldset>');
                }
            }
        }
        // console.log(parameters_added);
        // add parameters not in the group
        for (var ip = 0; ip < parameters.length; ip++) {
            if (!isInArray(parameters[ip]['param'], parameters_added)) {
                // console.log(parameters[ip]['param']);
                form_html.push(produce_one_parameter_form(parameters[ip]));
            }
        }
    } else {
        for (var i = 0; i < parameters.length; i++) {
            form_html.push(produce_one_parameter_form(parameters[i]));
        }
    }

    form_html.push('<input id="submit_button" class="btn btn-secondary" type="button" onclick="submit_form();" value="Submit">');

    $('#' + div).html(form_html.join(' '));
    $('#' + div).validator({
        custom: {
            "fasta": function ($el) {
                if (!validateFasta($el.val())) {
                    return "Please insert valid FASTA format";
                }
            }
        }
    });
}

function add_group_parameter(group_id) {
    // console.log(JSON.stringify(repeatable_groups));
    // var counter = repeatable_groups[group_id]['counter']++;
    ++repeatable_groups[group_id]['counter'];

    // console.log(JSON.stringify(repeatable_groups));
    var group_parameters = repeatable_groups[group_id]['parameters'];
    for (var i = 0; i < group_parameters.length; i++) {
        $('#' + group_id).append(produce_one_parameter_form(group_parameters[i], true, group_id));
    }


}

function selected_option(default_value, current_value, select_bool) {
    if (default_value == current_value) {
        if (select_bool) {
            return 'selected';
        } else {
            return 'checked';
        }
    } else {
        return '';
    }
}

function produce_one_parameter_form(parameter, repeatable, group_id) {
    var form_html = [];
    var param = parameter['param'];
    var param_name = parameter['so:name'];
    var display_name = param_name;
    if (display_name == undefined) {
        display_name = param;
    }
    var grassroots_type = parameter['grassroots_type'];
    var level = parameter['level'];
    var type = parameter['type'];
    var description = parameter['so:description'];
    var current_value = '';
    var default_value = '';
    var group = "none";
    var refresh = false;

    if (parameter['group'] !== undefined) {
        if (repeatable) {
            var counter;
            counter = repeatable_groups[group_id]['counter'];
            group = group_id + '^' + counter;
        }
    }
    if (parameter['refresh'] !== undefined) {
        refresh = parameter['refresh'];
    }

    if (grassroots_type == "params:directory") {
        if (parameter['current_value'] != undefined) {
            current_value = parameter['current_value']['value'];
        }
        if (default_value != undefined) {
            default_value = parameter['default_value']['value'];
        }
    } else {
        if (parameter['current_value'] != undefined) {
            current_value = parameter['current_value'];
        }
        if (parameter['default_value'] != undefined) {
            default_value = parameter['default_value'];
        }
        if (parameter['default_value'] != undefined && (grassroots_type == "params:unsigned_integer" || grassroots_type == "xsd:double")) {
            default_value = parseFloat(parameter['default_value'].toFixed(3));
        }
    }

    if (parameter['enum'] == undefined) {
        // boolean checkbox
        if (grassroots_type == "xsd:boolean") {
            // form_html.push('<div class="form-group">');
            // form_html.push('<label title="' + description + '">' + display_name + '</label>');
            // form_html.push('<label class="radio-inline">');
            // form_html.push(' <input type="radio" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + 'true" value="true" ' + selected_option(default_value, true, false) + '> True');
            // form_html.push('</label>');
            // form_html.push('<label class="radio-inline">');
            // form_html.push(' <input type="radio" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + 'false" value="false" ' + selected_option(default_value, false, false) + '> False');
            // form_html.push('</label>');
            // form_html.push('</div>');
            form_html.push('<div class="form-check ' + level + '">');
            form_html.push('<label class="form-check-label"  title="' + description + '">');
            form_html.push(' <input type="checkbox" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + 'true" value="true" ' + selected_option(default_value, true, false) + '> ');
            // form_html.push(display_name + ' <small>' + description + '</small>');
            form_html.push(display_name);
            form_html.push('</label>');
            form_html.push('</div>');


        }
        // input form integer
        else if (grassroots_type == "params:signed_integer" || grassroots_type == "params:unsigned_integer" || grassroots_type == "params:negative_integer" || grassroots_type == "params:unsigned_number") {

            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + '</label>');
            form_html.push('<input type="number" class="form-control"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '" value="' + default_value + '"/>');
            form_html.push('</div>');

        }
        // input form float
        else if (grassroots_type == "params:unsigned_integer" || grassroots_type == "xsd:double") {

            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + '</label>');
            form_html.push('<input type="number" class="form-control"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '" value="' + default_value + '"/>');
            form_html.push('</div>');

        }
        // input form text
        else if (grassroots_type == "xsd:string"
            || grassroots_type == "params:character" || grassroots_type == "params:keyword") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + '</label>');
            form_html.push('<input type="text" class="form-control"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '" value="' + default_value + '"/>');
            form_html.push('</div>');
        }
        // textarea
        else if (grassroots_type == "params:large_string" || grassroots_type == "params:json") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + '</label>');
            form_html.push('<textarea class="form-control" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '" rows="3">' + default_value + '</textarea>');
            form_html.push('</div>');
            textareas.push(param);

        }
        //fasta (textarea)
        else if (grassroots_type == "params:fasta") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + '</label>');
            form_html.push('<textarea class="form-control" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '" rows="6" data-fasta required>' + default_value + '</textarea>');
            form_html.push('<div class="help-block with-errors">FASTA format required</div>');
            form_html.push('</div>');
            textareas.push(param);

        }
        //file
        else if (grassroots_type == "params:input_filename" || grassroots_type == "params:output_filename") {
            // form_html.push('<div class="form-group '+level+'">');
            // form_html.push('<label title="' + description + '">' + display_name + '</label>');
            // form_html.push('<input type="file" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '^' + grassroots_type + '" />');
            // form_html.push('</div>');

            //form_html.push('<div id="' + param + '^' + grassroots_type + 'drop" class="dropzone">Drop file here</div>');
            //form_html.push('<input type="hidden" name="' + param + '^' + grassroots_type + '^' + group + '" id="' + param + '^' + grassroots_type + '" />');
        }
        // password
        else if (grassroots_type == "params:password") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + '</label>');
            form_html.push('<input type="password" class="form-control"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '^' + grassroots_type + '" value="' + default_value + '"/>');
            form_html.push('</div>');
        }
        // directory
        else if (grassroots_type == "params:directory") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + '</label>');
            form_html.push('<input type="password" class="form-control"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '^' + grassroots_type + '" value="' + default_value + '"/>');
            form_html.push('</div>');
        }
        // date
        else if (grassroots_type == "xsd:date") {
            form_html.push('<div class="form-group ' + level + '">');
            form_html.push('<label title="' + description + '">' + display_name + '</label>');
            form_html.push('<input  type="text" class="datepicker form-control"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '" value="' + default_value + '"/>');
            form_html.push('</div>');
        }
        // tabular
        else if (grassroots_type == "params:tabular") {
            var cHeading = parameter['store']['Column Headings'];
            var each_table_obj = {};
            var table_id = param.replace(/ /g, "_");

            each_table_obj['table_id'] = table_id;
            each_table_obj['cHeadings'] = cHeading;
            datatable_param_list.push(each_table_obj);
            form_html.push('<hr/><div class="form-group ' + level + '" style="margin: 20px 0px;">');
            form_html.push('<label title="' + description + '">' + display_name + '</label><br/>');
            form_html.push('<div class="sheet-drop" id="' + table_id + '^drop">Drop a spreadsheet file here to populate the table below</div>');
            form_html.push('<button class="btn btn-success new_row_button" type="button" style="" onclick="table_add_new_row(\'' + table_id + '\')">Add row</button>');
            form_html.push('<table id="' + table_id + '" class="display datatable_param">');
            form_html.push(table_thead_formatter(cHeading));
            // form_html.push('<label title="' + description + '">' + display_name + '</label>');
            // form_html.push('<input  type="text" class=" form-control"  name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '" value="' + default_value + '"/>');
            form_html.push('</table>');
            form_html.push('</div><hr/>');
        }
    }
    //select with options
    else {
        var outfmt_html = [];
        var enums = parameter['enum'];
        form_html.push('<div class="form-group ' + level + '">');
        form_html.push('<label title="' + description + '">' + display_name + '</label>');
        if (refresh) {
            form_html.push('<select class="form-control" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '^' + grassroots_type + '" onchange="refresh_service(this);">');
        } else {
            form_html.push('<select class="form-control" name="' + param + '^' + grassroots_type + '^' + type + '^' + group + '" id="' + param + '^' + grassroots_type + '">');
        }
        for (var j = 0; j < enums.length; j++) {
            var this_enum = enums[j];
            var option_text = this_enum['so:description'];
            if (this_enum['so:description'] == undefined) {
                option_text = this_enum['value']
            }
            form_html.push('<option value="' + this_enum['value'] + '" ' + selected_option(default_value, this_enum['value'], true) + '>' + option_text + '</option>');
            outfmt_html.push('<option value="' + this_enum['value'] + '">' + option_text + '</option>');
        }

        if ((selected_service_name === 'BlastN' || selected_service_name === 'BlastP' || selected_service_name === 'BlastX') && param === 'outfmt') {
            $('#output_format').html(outfmt_html.join(' '));
        }
        form_html.push('</select>');
        form_html.push('</div>');

    }
    return form_html.join(' ');
}

function refresh_service(input) {
    console.log(input);

    $('#status').html('<img src="/dynamic/images/ajax-loader.gif"/>');
    Utils.ui.disableButton('submit_button');
    var form = jQuery('#form').serializeArray();
    form = form.concat(
        jQuery('#form input[type=checkbox]:not(:checked)').map(
            function () {
                return {"name": this.name, "value": "false"}
            }).get()
    );
    var submission = {};
    var submit_job = {};
    var parameters = [];
    var services_array = [];
    var parameter_set = {};

    for (var idt = 0; idt < datatable_param_list.length; idt++) {

        var parameter = {};
        var datatableId = datatable_param_list[idt]['table_id'];
        var this_table_array = [];
        var current_value_array = [];
        var real_param = datatableId.replace(/_/g, " ");
        parameter['param'] = real_param;
        var this_table = $('#' + datatableId).DataTable();
        this_table_array = this_table.$('input, select').serializeArray();
        var row_length = this_table.rows().count();
        for (var rowsi = 0; rowsi < row_length; rowsi++) {
            var row_object = {};
            for (var ttai = 0; ttai < this_table_array.length; ttai++) {
                var name = this_table_array[ttai]['name'].split('^');
                var column_name = name[3];
                if (name[2] == rowsi) {
                    row_object[column_name] = this_table_array[ttai]['value'];
                }

            }
            current_value_array.push(row_object);
            console.log(JSON.stringify(current_value_array));
        }
        parameter['current_value'] = current_value_array;
        parameters.push(parameter);

    }

    for (var i = 0; i < form.length; i++) {
        var name = form[i]['name'].split('^');
        if (name[0] === 'tabular') {
            //do nothing? DataTable().serializeArray() takes over
        } else {
            var param = name[0];
            var grassroots_type = name[1];
            var type = name[2];
            var group = name[3];
            var value = form[i]['value'];
            var parameter = {};
            parameter['param'] = param;
            if (param === 'FT Facet') {
                fieldTrailSearchType = value;
            }
            // parameter['grassroots_type'] = grassroots_type;
            if (group != 'none') {
                if (name[4] == 0) {
                    parameter['group'] = repeatable_groups[group]['group'];
                } else {
                    parameter['group'] = repeatable_groups[group]['group'] + ' [' + name[4] + ']';
                }
            }

            if (type == 'boolean') {
                parameter['current_value'] = JSON.parse(value);
            } else if (type == 'integer') {
                parameter['current_value'] = parseInt(value);
            } else if (type == 'number') {
                parameter['current_value'] = parseFloat(value);
            } else {
                parameter['current_value'] = value;
            }
            parameters.push(parameter);
        }
    }

    submit_job['refresh_service'] = true;
    submit_job['so:name'] = selected_service_name;

    parameter_set['level'] = level_simpleoradvanced;
    parameter_set['parameters'] = parameters;
    submit_job['parameter_set'] = parameter_set;

    services_array.push(submit_job);
    submission['services'] = services_array;


    console.info(JSON.stringify(submission));
    console.info(server_url);
    $.ajax({
        url: server_url,
        data: JSON.stringify(submission),
        type: "POST",
        dataType: "json",
        success: function (json) {
            // do update values instead
            refresh_form_with_result(json);

            $('#status').html('');
        }
    });


}

function refresh_form_with_result(json) {
    parameters = json['services'][0]['operation']['parameter_set']['parameters'];
    groups = json['services'][0]['operation']['parameter_set']['groups'];
    produce_form('form', parameters, groups);

}

function isOdd(n) {
    return Math.abs(n % 2) == 1;
}

function do_ajax_search() {
    var input = $('#ft_ajax_search').val();

    var input_tail = "";

    if (isOdd((input.match(/\"/g) || []).length)) {
        input_tail = "\"";
    }
    if (((input.match(/\"/g) || []).length) == 0) {
        input_tail = "*";
    }

    console.log(input_tail);

    if (input.length > 1) {

        $('#ajax_result').html('Searching <img src=\"/dynamic/images/ajax-loader.gif\"/>');
        var timer;

        var submit_json = {
            "services": [
                {
                    "start_service": true,
                    "so:name": "Search Field Trials",
                    "parameter_set": {
                    		"level": "simple",
                        "parameters": [

                            {
                                "param": "FT Keyword Search",
                                "current_value": input + input_tail
                            },
                            {
                                "param": "FT Facet",
                                "current_value": "Treatment"
                            },
                            {
                                "param": "FT Results Page Number",
                                "current_value": 0
                            },
                            {
                                "param": "FT Results Page Size",
                                "current_value": 500
                            }
                        ]
                    }
                }
            ]
        };
        console.log(submit_json);

        clearTimeout(timer);

        timer = setTimeout(function () {
            $.ajax({
                url: server_url,
                data: JSON.stringify(submit_json),
                type: "POST",
                dataType: "json",
                success: function (json) {
                    var result_array = json['results'][0]['results'];
                    if (result_array == undefined) {
                        $('#ajax_result').html("No result found");
                    } else {
                        $('#ajax_result').html(format_treatment_ajax_result(result_array));
                        var datatable = $('#treatment_result').DataTable({
                            "searching": false,
                            "aaSorting": [],
                            dom: 'lBfrtip',
                            buttons: [
                                {
                                    extend: 'copyHtml5',
                                    title: null,
                                    messageTop: null,
                                    messageBottom: null,
                                    header: false,
                                    exportOptions: {
                                        columns: [8]
                                    }
                                },
                                {
                                    extend: 'csvHtml5',
                                    title: null,
                                    messageTop: null,
                                    messageBottom: null,
                                    header: false,
                                    exportOptions: {
                                        columns: [8]
                                    }
                                },
                                {
                                    extend: 'excelHtml5',
                                    title: null,
                                    messageTop: null,
                                    messageBottom: null,
                                    header: false,
                                    exportOptions: {
                                        columns: [8]
                                    }
                                }
                            ],
                            select: true
                        });
                        simpleOrAdvanced('show_simple');
                        //
                        // $('#treatment_result tbody').on('click', 'tr', function () {
                        //     var data = datatable.row(this).data();
                        //     copyToClipboard(data[8]);
                        //     $('#message').show();
                        //     $('#message').animate({opacity: 1.0}, 500).fadeOut();
                        //     console.log(data);
                        // });

                    }
                }
            });
        }, 0);
    } else {
        $('#ajax_result').html('Enter a longer search query.');
    }

}

function copyToClipboard(text) {

    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}


function format_treatment_ajax_result(array) {
    var html = [];

    html.push('<table class="display" id="treatment_result" width="100%">');
    html.push('<thead>');
    html.push('<tr>');
    html.push('<th>Trait name</th>');
    html.push('<th>Trait Ontology</th>');
    html.push('<th>Trait Description</th>');
    html.push('<th>Trait Abbreviation</th>');
    html.push('<th>Measurement Name</th>');
    html.push('<th>Measurement Ontology</th>');
    html.push('<th>Unit Name</th>');
    html.push('<th>Unit Ontology</th>');
    html.push('<th>Variable Name</th>');
    html.push('<th>Variable Ontology</th>');
    html.push('</tr>');
    html.push('</thead>');


    html.push('<tbody>');
    for (var i = 0; i < array.length; i++) {
        var trait = array[i]['data']['trait'];
        var measurement = array[i]['data']['measurement'];
        var unit = array[i]['data']['unit'];
        var variable = array[i]['data']['variable'];
        html.push('<tr>');
        html.push('<td>');
        html.push(trait['so:name']);
        html.push('</td>');
        html.push('<td>');
        html.push(trait['so:sameAs']);
        html.push('</td>');
        html.push('<td>');
        html.push(trait['so:description']);
        html.push('</td>');
        html.push('<td>');
        html.push(trait['abbreviation']);
        html.push('</td>');
        html.push('<td>');
        html.push(measurement['so:name']);
        html.push('</td>');
        html.push('<td>');
        html.push(measurement['so:sameAs']);
        html.push('</td>');
        html.push('<td>');
        html.push(unit['so:name']);
        html.push('</td>');
        html.push('<td>');
        html.push(unit['so:sameAs']);
        html.push('</td>');
        html.push('<td>');
        html.push(variable['so:name']);
        html.push('</td>');
        html.push('<td>');
        html.push(variable['so:sameAs']);
        html.push('</td>');
        html.push('</tr>');
    }
    html.push('</tbody>');
    html.push('</table>');


    return html.join(' ');
}

function table_thead_formatter(cHeadings) {
    var thead_html = [];
    thead_html.push('<thead>');
    thead_html.push('<tr>');
    // Column Headings : "[ { "param": "Accession", "type": "xsd:string" }, { "param": "Trait Identifier", "type": "xsd:string" }, { "param": "Trait Abbreviation", "type": "xsd:string" }, { "param": "Trait Name", "type": "xsd:string" }, { "param": "Trait Description", "type": "xsd:string" }, { "param": "Method Identifier", "type": "xsd:string" }, { "param": "Method Abbreviation", "type": "xsd:string" }, { "param": "Method Name", "type": "xsd:string" }, { "param": "Method Description", "type": "xsd:string" }, { "param": "Unit Identifier", "type": "xsd:string" }, { "param": "Unit Abbreviation", "type": "xsd:string" }, { "param": "Unit Name", "type": "xsd:string" }, { "param": "Unit Description", "type": "xsd:string" }, { "param": "Form Identifier", "type": "xsd:string" }, { "param": "Form Abbreviation", "type": "xsd:string" }, { "param": "Form Name", "type": "xsd:string" }, { "param": "Form Description", "type": "xsd:string" } ]"
    for (var i = 0; i < cHeadings.length; i++) {
        thead_html.push('<th>' + cHeadings[i]['param'] + '</th>');
    }
    thead_html.push('</tr>');
    thead_html.push('</thead>');
    return thead_html.join(' ');
}

function table_add_rows(table_id_drop, json) {
    var name = table_id_drop.split('^');
    var table_id = name[0];

    var t = $('#' + table_id).DataTable();
    var row_index = t.rows().count();

    for (var rs = 1; rs < json.length; rs++) {
        t.row.add(json[rs]).draw(false);
    }
    console.log(row_index);
    if (row_index == 1) {
        console.log('deleting first row...');
        t.row(0).remove().draw();
    }

}

function table_add_rows_csv(table_id_drop, csv) {
    var json = CSVJSON.csv2json(csv, {});
    console.log(JSON.stringify(json));
    var name = table_id_drop.split('^');
    var table_id = name[0];

    var t = $('#' + table_id).DataTable();
    var row_index = t.rows().count();


    console.log(row_index);
    if (row_index == 1) {
        console.log('deleting first row...');
        t.row(0).remove().draw();
        row_index = 0;
    }


    var cHeadings = [];
    for (var i = 0; i < datatable_param_list.length; i++) {
        if (datatable_param_list[i]['table_id'] === table_id) {
            cHeadings = datatable_param_list[i]['cHeadings'];
        }
    }
    for (var rs = 0; rs < json.length; rs++) {
        var sheet_row_json = json[rs];
        var row_array = [];
        var real_param = table_id.replace(/_/g, " ");
        for (var r = 0; r < cHeadings.length; r++) {
            var column_param = cHeadings[r]['param'];
            var column_grassroots_type = cHeadings[r]['type'];
            var sheet_value = "";
            if (sheet_row_json[column_param] != undefined) {
                sheet_value = sheet_row_json[column_param];
            }
            row_array.push('<input type="text" name="tabular^' + real_param + '^' + row_index + '^' + column_param + '^' + column_grassroots_type + '" value="' + sheet_value + '"/>');
        }
        t.row.add(row_array).draw(false);
        row_index++;
    }
}

function table_add_new_row(table_id) {
    var t = $('#' + table_id).DataTable();
    var row_index = t.rows().count();
    var cHeadings = [];
    for (var i = 0; i < datatable_param_list.length; i++) {
        if (datatable_param_list[i]['table_id'] === table_id) {
            cHeadings = datatable_param_list[i]['cHeadings'];
        }
    }
    var row_array = [];
    var real_param = table_id.replace(/_/g, " ");
    for (var r = 0; r < cHeadings.length; r++) {
        var column_param = cHeadings[r]['param'];
        var column_grassroots_type = cHeadings[r]['type'];
        row_array.push('<input type="text" name="tabular^' + real_param + '^' + row_index + '^' + column_param + '^' + column_grassroots_type + '" value=""/>');
    }
    t.row.add(row_array).draw(false);
}

function simpleOrAdvanced(string) {
    if (selected_service_name === 'Search Treatment' || selected_service_name === 'SearchTreatment') {
        var treatment_table = $('#treatment_result').DataTable();
        if (string === 'show_simple') {
            treatment_table.column(1).visible(false);
            treatment_table.column(5).visible(false);
            treatment_table.column(7).visible(false);
            treatment_table.column(9).visible(false);
            level_simpleoradvanced = "simple";
        } else if (string === 'show_advanced') {
            treatment_table.column(1).visible(true);
            treatment_table.column(5).visible(true);
            treatment_table.column(7).visible(true);
            treatment_table.column(9).visible(true);
            level_simpleoradvanced = "advanced";
        }

    } else {
        if (string === 'show_simple') {
            $('.advanced').hide();
            $('.simple').show();
            level_simpleoradvanced = "simple";

        } else if (string === 'show_advanced') {
            $('.simple').hide();
            $('.advanced').show();
            level_simpleoradvanced = "advanced";
        }
    }
}

function submit_form() {
    $('#status').html('<img src="/dynamic/images/ajax-loader.gif"/>');
    Utils.ui.disableButton('submit_button');
    var form = jQuery('#form').serializeArray();
    form = form.concat(
        jQuery('#form input[type=checkbox]:not(:checked)').map(
            function () {
                return {"name": this.name, "value": "false"}
            }).get()
    );
    var submission = {};
    var submit_job = {};
    var parameters = [];
    var services_array = [];
    var parameter_set = {};

    for (var idt = 0; idt < datatable_param_list.length; idt++) {

        var parameter = {};
        var datatableId = datatable_param_list[idt]['table_id'];
        var this_table_array = [];
        var current_value_array = [];
        var real_param = datatableId.replace(/_/g, " ");
        parameter['param'] = real_param;
        var this_table = $('#' + datatableId).DataTable();
        this_table_array = this_table.$('input, select').serializeArray();
        var row_length = this_table.rows().count();
        for (var rowsi = 0; rowsi < row_length; rowsi++) {
            var row_object = {};
            for (var ttai = 0; ttai < this_table_array.length; ttai++) {
                var name = this_table_array[ttai]['name'].split('^');
                var column_name = name[3];
                if (name[2] == rowsi) {
                    row_object[column_name] = this_table_array[ttai]['value'];
                }

            }
            current_value_array.push(row_object);
            console.log(JSON.stringify(current_value_array));
        }
        parameter['current_value'] = current_value_array;
        parameters.push(parameter);

    }

    for (var i = 0; i < form.length; i++) {
        var name = form[i]['name'].split('^');
        if (name[0] === 'tabular') {
            //do nothing? DataTable().serializeArray() takes over
        } else {
            var param = name[0];
            var grassroots_type = name[1];
            var type = name[2];
            var group = name[3];
            var value = form[i]['value'];
            var parameter = {};
            parameter['param'] = param;
            if (param === 'FT Facet') {
                fieldTrailSearchType = value;
            }
            // parameter['grassroots_type'] = grassroots_type;
            if (group != 'none') {
                if (name[4] == 0) {
                    parameter['group'] = repeatable_groups[group]['group'];
                } else {
                    parameter['group'] = repeatable_groups[group]['group'] + ' [' + name[4] + ']';
                }
            }

            if (type == 'boolean') {
                parameter['current_value'] = JSON.parse(value);
            } else if (type == 'integer') {
                parameter['current_value'] = parseInt(value);
            } else if (type == 'number') {
                parameter['current_value'] = parseFloat(value);
            } else {
                parameter['current_value'] = value;
            }
            parameters.push(parameter);
        }
    }

    submit_job['start_service'] = true;
    submit_job['so:name'] = selected_service_name;

    parameter_set['level'] = level_simpleoradvanced;
    parameter_set['parameters'] = parameters;
    submit_job['parameter_set'] = parameter_set;

    services_array.push(submit_job);
    submission['services'] = services_array;


    console.info(JSON.stringify(submission));
    console.info(server_url);
    $.ajax({
        url: server_url,
        data: JSON.stringify(submission),
        type: "POST",
        dataType: "json",
        success: function (json) {
            display_result(json);
        }
    });
}

function get_api_result(service, previousID) {
    selected_service_name = service;
    $('#title').html(service);
    $('#status').html('<img src="/dynamic/images/ajax-loader.gif"/>');
    $.ajax({
        url: server_url + '/service/' + encodeURIComponent(service) + '?Previous%20results=' + previousID,
        // type: "GET",
        dataType: "json",
        cache: true,
        success: function (json) {
            var status_text_key = json['results'][0]['status_text'];
            if (status_text_key == 'Partially succeeded' || status_text_key == 'Succeeded') {
                display_result(json);
            } else {
                setTimeout(function () {
                    location.reload();
                }, 5000);
            }
        }
    });


}


function display_result(json) {
    Utils.ui.reenableButton('submit_button', 'Submit');
    // response = json;
    console.info(JSON.stringify(json));
    //            if (synchronous){
    if (selected_service_name == 'BlastN' || selected_service_name == 'BlastP' || selected_service_name == 'BlastX') {
        $('#status').html('');
        $('#result').html('');
        // get each job and place html
        for (var i = 0; i < json['results'].length; i++) {
            var each_result = json['results'][i];
            var uuid = each_result['job_uuid'];
            var dbname = each_result['so:name'];
            $('#result').append('<fieldset><legend>' + dbname + '</legend><div><p><b>Job ID: ' + uuid + '</b></p><div id=\"' + uuid + '\">Job Submitted <img src=\"/dynamic/images/ajax-loader.gif\"/></div></div></br></fieldset>');

            checkResult(each_result);
        }
        $('#output_format_div').show();
        changeDownloadFormat();
    } else if (selected_service_name == 'Polymarker') {
        $('#status').html('');
        $('#result').html('');
        for (var i = 0; i < json['results'].length; i++) {
            var each_result = json['results'][i];
            var uuid = each_result['job_uuid'];
            var dbname = each_result['so:name'];
            $('#result').append('<fieldset><legend>' + dbname + '</legend><div><p><b>Job ID: ' + uuid + '</b></p><div id=\"' + uuid + '\">Job Submitted <img src=\"/dynamic/images/ajax-loader.gif\"/></div></div></br></fieldset>');

            checkResult(each_result);
        }

    } else if (selected_service_name == 'Pathogenomics Geoservice' || selected_service_name == 'Pathogenomics Geoservice') {
        $('#status').html('');
        $('#result').html(JSON.stringify(json['results'][0]['results'][0]['data']));
    } else if (selected_service_name == 'Search GRU seedbank') {
        $('#simpleAdvanceWrapper').hide();
        $('#status').html('');
        $('#form').html('');
        $('#tableWrapper').html('<table id="resultTable"></table>');
        // $('#result').html(JSON.stringify(json['results'][0]['results'][0]['data']));
        markersGroup = new L.MarkerClusterGroup({});
        map = L.map('map', {zoomControl: false}).setView([52.621615, 10.219470], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: 18
        }).addTo(map);

        L.control.zoom({position: 'topright'}).addTo(map);

        startGIS(json['results'][0]['results']);
        map.fitWorld({reset: true}).zoomIn();
    }
    //old field trial showing map directly
    // else if (selected_service_name == 'Search Field Trials') {
    //     $('#simpleAdvanceWrapper').hide();
    //     $('#status').html('');
    //     $('#form').html('');
    //     $('#tableWrapper').html('<table id="resultTable"></table>');
    //     // $('#result').html(JSON.stringify(json['results'][0]['results'][0]['data']));
    //     markersGroup2 = new L.MarkerClusterGroup({});
    //     map = L.map('map', {zoomControl: false}).setView([52.621615, 10.219470], 5);
    //
    //        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    //            maxZoom: 18
    //        }).addTo(map);
    //
    //     L.control.zoom({position: 'topright'}).addTo(map);
    //
    //     startFieldTrialGIS(json['results'][0]['results']);
    // }
    else if (selected_service_name == 'Search Field Trials') {
        // $('#simpleAdvanceWrapper').hide();
        $('#status').html('');
        $('#map').remove();
        // $('#form').html('');
        $('#tableWrapper').html('<table class="display" id="resultTable" width="100%"></table>');
        var resultsList = json['results'][0]['results'];
        $('#resultTable').html(format_fieldtrial_result(resultsList));
        var datatable = $('#resultTable').DataTable({
            // "searching": false,
            "aaSorting": []
        });


    } else {
        $('#status').html('');
        var status_text_key = json['results'][0]['status_text'];
        if (status_text_key == 'Partially succeeded' || status_text_key == 'Succeeded') {
            $('#result').html("Done");
            downloadFile(json['results'][0]['results'][0]['data'], selected_service_name);
        } else if (status_text_key == 'Failed' || status_text_key == 'Failed to start' || status_text_key == 'Error') {
            $('#result').html('Job ' + status_text_key);
            //+ ': <br/>' + each_result['errors']['error']);
            Utils.ui.reenableButton('submit_button', 'Submit');
        }

    }
}

function format_fieldtrial_result(array) {
    var html = [];

    html.push('<thead>');
    html.push('<tr>');
    html.push('<th>Rank</th>');
    html.push('<th>Type</th>');
    html.push('<th>Title</th>');
    html.push('<th>Info</th>');
    html.push('<th>Link</th>');
    html.push('</tr>');
    html.push('</thead>');

    html.push('<tbody>');
    for (var i = 0; i < array.length; i++) {
        var id = array[i]['data']['_id']['$oid'];

        var type = '';

        if (array[i]['data'] != undefined) {
            type = array[i]['data']['@type'];
        }
        var title = array[i]['title'];
        var info = ''; //JSON.stringify(array[i]['data']);
        var doi = '';

        var typeText = '';
        if (type === 'Grassroots:FieldTrial') {
            typeText = 'Field Trial';
            info = array[i]['data']['team'];
        }
        if (type === 'Grassroots:Study') {
            typeText = 'Study';
            var address_name = (array[i]['data']['address']['address']['Address']['name'] != undefined) ? array[i]['data']['address']['address']['Address']['name']  + '<br/>' : "";
            var address_locality = (array[i]['data']['address']['address']['Address']['addressLocality'] != undefined) ? array[i]['data']['address']['address']['Address']['addressLocality'] + '<br/>' : "";
            var address_country = (array[i]['data']['address']['address']['Address']['addressCountry'] != undefined) ? array[i]['data']['address']['address']['Address']['addressCountry'] + '<br/>' : "";
            var address_postcode = (array[i]['data']['address']['address']['Address']['postalCode'] != undefined) ? array[i]['data']['address']['address']['Address']['postalCode'] : "";

            info = address_name
                + address_locality
                + address_country
                + address_postcode;
        }
        if (type === 'Grassroots:Phenotype') {
            typeText = 'Phenotype';
            info = array[i]['data']['trait']['so:name'];
        }
        if (type === 'Grassroots:FieldTrial' || type === 'Grassroots:Study') {
            doi = '<a target="_blank" href="../dynamic/fieldtrial_dynamic.html?id=' + id + '&type=' + type + '">View ' + typeText + '</a>'
        }
        html.push('<tr>');
        html.push('<td>');
        html.push(i + 1);
        html.push('</td>');
        html.push('<td>');
        html.push(typeText);
        html.push('</td>');
        html.push('<td>');
        html.push(title);
        html.push('</td>');
        html.push('<td>');
        html.push(info);
        html.push('</td>');
        html.push('<td>');
        html.push(doi);
        html.push('</td>');
        html.push('</tr>');
    }
    html.push('</tbody>');


    return html.join(' ');
}

function checkResult(each_result) {
    var uuid = each_result['job_uuid'];
    var status_text_key = each_result['status_text'];
    if (status_text_key == 'Partially succeeded' || status_text_key == 'Succeeded') {
        Utils.ui.reenableButton('submit_button', 'Submit');
        if (selected_service_name == 'BlastN' || selected_service_name == 'BlastP' || selected_service_name == 'BlastX') {
            $('#' + uuid).html(display_each_blast_result_grasroots_markup(each_result));
        } else if (selected_service_name == 'Polymarker') {
            $('#' + uuid).html(display_polymarker_table(each_result));
        } else {
            $('#status').html('');
            $('#result').html("Done");
            $('#' + uuid).html(JSON.stringify(each_result['results'][0]['data']));
        }
    } else if (status_text_key == 'Failed' || status_text_key == 'Failed to start' || status_text_key == 'Error') {
        $('#' + uuid).html('Job ' + status_text_key);
        //+ ': <br/>' + each_result['errors']['error']);
        Utils.ui.reenableButton('submit_button', 'Submit');
    } else {
        $.ajax({
                url: server_url,
                data: '{"operations": {"operation": "get_service_results"}, "services": ["' + uuid + '"]}',
                type: "POST",
                dataType: "json",
                success: function (json) {
                    console.info(JSON.stringify(json));
                    status_text_key = json[0]['status_text'];
                    if (status_text_key == 'Partially succeeded' || status_text_key == 'Succeeded') {
                        if (selected_service_name == 'BlastN' || selected_service_name == 'BlastP' || selected_service_name == 'BlastX') {
                            Utils.ui.reenableButton('submit_button', 'Submit');
                            $('#' + uuid).html(display_each_blast_result_grasroots_markup(json[0]));
                        } else if (selected_service_name == 'Polymarker') {
                            $('#' + uuid).html(display_polymarker_table(json[0]));
                        } else if (selected_service_name == 'Search GRU seedbank' || selected_service_name == 'Pathogenomics Geoservice' || selected_service_name == 'Search Field Trials') {
                            $('#' + uuid).html(JSON.stringify(json[0]['results'][0]['data']));
                        } else {
                            $('#status').html('');
                            $('#result').html("Done");
                            downloadFile(json[0]['results'][0]['data'], selected_service_name);
                        }
                    } else if (status_text_key == 'Idle' || status_text_key == 'Pending' || status_text_key == 'Started' || status_text_key == 'Finished') {
                        jQuery('#' + uuid).html('Job ' + status_text_key + ' <img src=\"/dynamic/images/ajax-loader.gif\"/>');
                        var timer;
                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            checkResult(each_result);
                        }, 6500);
                    } else {
                        jQuery('#' + uuid).html('Job ' + status_text_key + ' ' + json[0]['errors']);
                        Utils.ui.reenableButton('submit_button', 'Submit');
                    }
                }
            }
        );
    }
}


function display_blast_result_grassroots_markup(json) {

    var result_html = [];
    result_html.push('<br/><br/><hr/><br/>');

    for (var i = 0; i < json['results'].length; i++) {
        result_html.push(display_each_blast_result_grasroots_markup(json['results'][i]));
    }
    $('#form').html('');
    window.scrollTo(0, 0);
    $('#result').html(result_html.join(' '));
    $('#output_format_div').show();
    changeDownloadFormat();
}

function display_each_blast_result_grasroots_markup(each_db_result) {

    var result_html = [];
    if (each_db_result['service_name'] == 'BlastN') {
        //            var each_db_result = json['results'][i];
        var uuid = each_db_result['job_uuid'];
        if (each_db_result['status_text'] == 'Succeeded') {

            var db_name = each_db_result['name'];

            result_html.push('<a href="javascript:;" id=\"' + uuid + 'dl\" onclick=\"downloadJobFromServer(\'' + uuid + '\');\">Download Job</a> in <span class="dlformat">Pairwise</span> format <span id=\"' + uuid + 'status\"></span><br/>');

            for (var dbi = 0; dbi < each_db_result['results'][0]['data']['blast_search_results']['reports'].length; dbi++) {

                var query_result = each_db_result['results'][0]['data']['blast_search_results']['reports'][dbi];
                var query_title = '';
                if (query_result['query_title'] != undefined) {
                    query_title = query_result['query_title'];
                }
                var query_line = query_result['query_id'] + ': ' + query_title;
                result_html.push('<p><b>' + query_line + '</b></p>');

                if (query_result['hits'].length > 0) {
                    for (var j = 0; j < query_result['hits'].length; j++) {

                        var hit = query_result['hits'][j];
                        var hit_num = hit['hit_num'];
                        var scaffold_name = hit['scaffolds'][0]['scaffold'];

                        result_html.push('<div class="blastResultBox ui-corner-all">')

                        result_html.push('<p>Hit ' + hit_num + ' : ' + scaffold_name + ' | <b>Hit Sequence Length: </b>' + hit['sequence_length']);
                        result_html.push('</p>');

                        if (hit['linked_services'] != null) {
                            if (hit['linked_services']['services'].length > 0) {
                                result_html.push('<p>Linked Services: ');
                                for (var linki = 0; linki < hit['linked_services']['services'].length; linki++) {
                                    var link_service_json = hit['linked_services']['services'][linki];
                                    var link_service_id = generate_random_id();
                                    linked_services_global[link_service_id] = link_service_json;
                                    if (linki > 0) {
                                        result_html.push(' | ');
                                    }

                                    result_html.push(' <a href="javascript:;" id="' + link_service_id + '" onclick="run_linked_service(\'' + link_service_id + '\')">' + link_service_json['so:name'] + '</a><span id="' + link_service_id + 'status"></span> ');

                                }
                                result_html.push('</p>');
                            }
                        }


                        for (var y = 0; y < hit['hsps'].length; y++) {
                            var hsp = hit['hsps'][y];
                            var hsp_num = hsp['hsp_num'];
                            result_html.push('<p>Hsp: ' + hsp_num + '</p>');
                            // result_html.push('<p><b>Bit Score: </b>' + hsp['bit_score'] + ' | <b>Gaps: </b>' + hsp['gaps'] + '</p>');
                            result_html.push('<p><b>Bit Score: </b>' + hsp['bit_score'] + '</p>');
                            result_html.push('<p><b>Score: </b>' + hsp['score'] + ' | <b>Evalue: </b>' + hsp['evalue'] + '</p>');
                            //result_html.push('<p>'+  +'</p>');
                            result_html.push('<hr/>');
                            if (hsp['polymorphisms'] != undefined) {
                                if (hsp['polymorphisms'].length > 0) {
                                    result_html.push('<p>Polymorphisms (Polymarker):</p>');
                                    result_html.push('<p>');
                                    for (var ip = 0; ip < hsp['polymorphisms'].length; ip++) {
                                        var polymorphism = hsp['polymorphisms'][ip];
                                        console.log(JSON.stringify(polymorphism));
                                        if (polymorphism['linked_services'] != undefined) {
                                            if (polymorphism['linked_services']['services'] != undefined) {
                                                for (var linkip = 0; linkip < polymorphism['linked_services']['services'].length; linkip++) {
                                                    var polymorphism_link_service_json = polymorphism['linked_services']['services'][linkip];
                                                    var polymorphism_link_service_id = generate_random_id();
                                                    var sequence_difference = '[' + polymorphism['sequence_difference']['query'] + '/' + polymorphism['sequence_difference']['hit'] + ']';
                                                    // save in memory for post request
                                                    linked_services_global[polymorphism_link_service_id] = polymorphism_link_service_json;
                                                    var polymorphism_position = polymorphism['locus']['faldo:begin']['faldo:position'];
                                                    result_html.push(' <a href="javascript:;" id="' + polymorphism_link_service_id + '"'
                                                        + ' onmouseover="mouseover_locus(\'' + hit_num + '\', \'' + hsp_num + '\', \'' + polymorphism_position + '\')"'
                                                        + ' onmouseout="mouseout_locus(\'' + hit_num + '\', \'' + hsp_num + '\', \'' + polymorphism_position + '\')"'
                                                        + ' onclick="run_linked_service_with_redirect(\''
                                                        + polymorphism_link_service_id + '\')">Locus: ' + polymorphism_position + ' '
                                                        + sequence_difference + ' </a><span id="' + polymorphism_link_service_id + 'status"></span> |');


                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            result_html.push('</p>');
                            result_html.push('<hr/>');


                            result_html.push('<div class="note">');
                            result_html.push('<p class="blastPosition">Query from: ' + hsp['query_location']['faldo:begin']['faldo:position'] + ' to: ' + hsp['query_location']['faldo:end']['faldo:position'] + ' Strand: ' + get_faldo_strand(hsp['query_location']['faldo:begin']['@type']) + '</p>');
                            result_html.push(alignment_formatter(hsp['query_sequence'].match(/.{1,100}/g), hsp['midline'].match(/.{1,100}/g), hsp['hit_sequence'].match(/.{1,100}/g), hit['hit_num'], hsp['hsp_num']));
                            result_html.push('<p class="blastPosition">Hit from: ' + hsp['hit_location']['faldo:begin']['faldo:position'] + ' to: ' + hsp['hit_location']['faldo:end']['faldo:position'] + ' Strand: ' + get_faldo_strand(hsp['hit_location']['faldo:begin']['@type']) + '</p>');
                            result_html.push('</div>');
                        }
                        result_html.push('</div>');
                    }
                } else {
                    result_html.push('<p>No hits found</p>')
                }
            }

        } else {
            result_html.push('<p>Job id: ' + uuid + '</p>');
            result_html.push('<p>Status: ' + each_db_result['status_text'] + '</p>');
        }
    }
    return result_html.join(' ');
}

function mouseover_locus(hit_num, hsp_num, polymorphism_position) {
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'q').addClass('highlightSNP');
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'm').addClass('highlightSNP');
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'h').addClass('highlightSNP');
}

function mouseout_locus(hit_num, hsp_num, polymorphism_position) {
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'q').removeClass('highlightSNP');
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'm').removeClass('highlightSNP');
    $('#' + hit_num + '-' + hsp_num + '-' + polymorphism_position + 'h').removeClass('highlightSNP');
}

function display_polymarker_table(jsonResult) {
    // console.log('>>>' + JSON.stringify(jsonResult));
    var uuid = jsonResult['job_uuid'];
    var csv_values = jsonResult['results'][0]['data']['primers'];
    var csv_table_selector = $('#' + uuid);
    var exons_genes_and_contigs = jsonResult['results'][0]['data']['exons_genes_and_contigs'];
    var csv_table = csv_table_selector.CSVToTable(csv_values, {
        headers: ["ID", "SNP", "Chr", "CTotal", "Contig regions", "SNP type", "A", "B", "Common", "Primer type", "Product size", "Error"],
        startLine: 1
    });
    csv_table.bind("loadComplete", function () {
        console.log("bind table");
        csv_table_selector.jExpand();
        csv_table_selector.load_msa(exons_genes_and_contigs);
    });
    // $('#statusTable').jExpand();

    // $("#show_list").click(function () {
    //     $("#statusTable").toggle();
    // });
    // $("#statusTable").hide();
    // $("#show_mask").click(function () {
    //     csv_table_selector.show_all();
    // });
    // $("#hide_mask").click(function () {
    //     csv_table_selector.hide_all();
    // });
}

function get_faldo_strand(faldo_type) {
    var strand;
    if ($.inArray("faldo:ForwardStrandPosition", faldo_type) >= 0) {
        strand = "Forward";
    } else if ($.inArray("faldo:ReverseStrandPosition", faldo_type) >= 0) {
        strand = "Reverse";
    } else {
        strand = "Unknown";
    }
    return strand;
}

function alignment_formatter(qseq, midline, hseq, hit_num, hsp_num) {
    var alignment_html = [];
    alignment_html.push('<div class="pre-format">');
    for (var i = 0; i < qseq.length; i++) {
        // alignment_html.push(qseq[i] + '<br/>');
        // alignment_html.push(midline[i] + '<br/>');
        // alignment_html.push(hseq[i] + '<br/>');
        alignment_html.push(add_span_with_position(qseq[i], i, hit_num, hsp_num, 'q') + '<br/>');
        alignment_html.push(add_span_with_position(midline[i], i, hit_num, hsp_num, 'm') + '<br/>');
        alignment_html.push(add_span_with_position(hseq[i], i, hit_num, hsp_num, 'h') + '<br/>');
    }
    alignment_html.push('</div>');

    return alignment_html.join(' ');

}

function add_span_with_position(seq, row_index, hit_num, hsp_num, qORh) {
    var chars = seq.split('');
    var html = [];
    $.each(chars, function (i, el) {
        html.push('<span id="' + hit_num + '-' + hsp_num + '-' + (i + 1 + (row_index * 100)) + qORh + '">' + el + '</span>');
    });
    return html.join('');
}

function remove_strange_char(str) {
    str = str.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\\\/g, "\\")
        .replace(/\\f/g, "\\f");
    return str.replace(/[\u0000-\u0019]+/g, "");
}

function changeDownloadFormat() {
    $('.dlformat').html(jQuery("#output_format option:selected").text());
}

function downloadJobFromServer(id) {
    $('#' + id + 'status').html('<img src="/dynamic/images/ajax-loader.gif"/>');
    $('#' + id + 'dl').removeAttr('onclick');
    var outfmt = $('#output_format').val();

    var previousjob_request_json = {
        "services": [{
            "start_service": true,
            "so:name": "BlastN",
            "parameter_set": {
                "parameters": [{
                    "param": "job_id",
                    "grassroots_type": "xsd:string",
                    "current_value": id
                }, {"param": "outfmt", "grassroots_type": "xsd:string", "current_value": outfmt}]
            }
        }]
    };
    console.info(JSON.stringify(previousjob_request_json));
    $.ajax({
        url: server_url,
        data: JSON.stringify(previousjob_request_json),
        type: "POST",
        dataType: "json",
        success: function (json) {
            console.info(JSON.stringify(json));

            downloadFile(json['results'][0]['results'][0]['data'], id);
            jQuery('#' + id + 'status').html('');
            jQuery('#' + id + 'dl').attr('onclick', 'downloadJobFromServer(\'' + id + '\')');
        }


    });


}


function run_linked_service(id) {
    $('#' + id + 'status').html('<img src="/dynamic/images/ajax-loader.gif"/>');
    $('#' + id).removeAttr('onclick');

    var linked_service_request_json = linked_services_global[id];
    console.info(JSON.stringify({"services": [linked_service_request_json]}));

    $.ajax({
        url: server_url,
        data: JSON.stringify({"services": [linked_service_request_json]}),
        // data: JSON.stringify(lined_service_request_json),
        type: "POST",
        dataType: "json",
        success: function (json) {
            console.info(JSON.stringify(json));

            downloadFile(json['results'][0]['results'][0]['data'], id);
            $('#' + id + 'status').html('');
            $('#' + id).attr('onclick', 'run_linked_service(\'' + id + '\')');
        }
    });
}


function run_linked_service_with_redirect(id) {
    $('#' + id + 'status').html('<img src="/dynamic/images/ajax-loader.gif"/>');
    $('#' + id).removeAttr('onclick');

    var linked_service_request_json = linked_services_global[id];
    console.info(JSON.stringify({"services": [linked_service_request_json]}));
    var service_name = linked_service_request_json['so:name'];

    $.ajax({
        url: server_url,
        data: JSON.stringify({"services": [linked_service_request_json]}),
        type: "POST",
        dataType: "json",
        success: function (json) {
            console.info(JSON.stringify(json));
            var uuid = json['results'][0]['job_uuid'];
            window.open("/dynamic/services_get.html?service=" + encodeURI(service_name) + '&Previous%20results=' + uuid, '_blank');
            $('#' + id + 'status').html('');
            $('#' + id).attr('onclick', 'run_linked_service_with_redirect(\'' + id + '\')');

        }
    });
}

function downloadFile(text, filename) {
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename + ".txt");
}

function generate_random_id() {
    var id = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        id += possible.charAt(Math.floor(Math.random() * possible.length));

    return id;
}


function validateFasta(fasta) {
    if (!fasta) { // check there is something first of all
        return false;
    }

    // immediately remove trailing spaces
    fasta = fasta.trim();

    // split on newlines...
    var lines = fasta.split('\n');

    // check for header
    for (var i = 0; i < lines.length; i++) {
        if (lines[i][0] == '>') {
            // remove one line, starting at the first position
            lines.splice(i, 1);
        }
    }

    // join the array back into a single string without newlines and
    // trailing or leading spaces
    fasta = lines.join('').trim();

    if (!fasta) { // is it empty whatever we collected ? re-check not efficient
        return false;
    }

    // note that the empty string is caught above
    // allow for Selenocysteine (U)
    return /^[ACDEFGHIKLMNPQRSTUVWY\s]+$/i.test(fasta);

}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    var f = files[0];
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
        f.size, ' bytes, last modified: ',
        f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
        '</li>');
    // document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    //var f = files[0];
    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;
            document.getElementById(evt.target.id).value = contents;
            //            console.info(evt.target.id);
            $('#' + String(evt.target.id)).trigger("change");
        }
        r.readAsText(f);
    } else {
        alert("Failed to load file");
    }
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function handleXlsxFileSelect(evt) {

    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.
    var table_id = evt.target.id;

    // files is a FileList of File objects. List some properties.
    var f = files[0];

    //var f = files[0];
    if (f) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            data = new Uint8Array(data);
            // console.log(XLSX.utils.sheet_to_csv((XLSX.read(data, {type: 'array'}))));
            //  console.log(((XLSX.read(data, {type: 'array'}))));
            var workbook = XLSX.read(data, {type: 'array'});
            var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
            // var json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header:1});
            console.log('tableid: ' + table_id);
            // table_add_rows(table_id,json);
            console.log('csv: ' + csv.trim());
            table_add_rows_csv(table_id, csv.trim());

        };
        reader.readAsArrayBuffer(f);
    } else {
        alert("Failed to load file");
    }
}

// deprecated
// function display_blast_result_jsonout(json) {
//     var result_html = [];
//     result_html.push('<br/><br/><hr/><br/>');
//
//     for (var i = 0; i < json['results'].length; i++) {
//         var blast_result_string = json['results'][i]['results'][0]['data'];
//         var uuid = json['job_uuid'];
//         var description = json['results'][i]['so:description'];
//         var db = json['results'][i]['so:name'];
//
//         blast_result_string = blast_result_string.replace(/\\n/g, "\\n")
//             .replace(/\\'/g, "\\'")
//             .replace(/\\"/g, '\\"')
//             .replace(/\\&/g, "\\&")
//             .replace(/\\r/g, "\\r")
//             .replace(/\\t/g, "\\t")
//             .replace(/\\b/g, "\\b")
//             .replace(/\\\\/g, "\\")
//             .replace(/\\f/g, "\\f");
//         blast_result_string = blast_result_string.replace(/[\u0000-\u0019]+/g, "");
//
//         var blast_result_json = JSON.parse(blast_result_string);
//         console.log(blast_result_json['BlastOutput2'].length);
//         console.log(JSON.stringify(blast_result_json));
//
//         result_html.push('<fieldset>');
//         result_html.push('<legend>' + description + '</legend>');
//         for (var j = 0; j < blast_result_json['BlastOutput2'].length; j++) {
//             var query_result = blast_result_json['BlastOutput2'][j]['report']['results'];
//             var query_title = query_result['search']['query_title'];
//             if (query_title == 'undefined'){
//                 query_title = '';
//             }
//             var query_line = query_result['search']['query_id'] + ': ' + query_title;
//             result_html.push('<p><b>' + query_line + '</b></p>');
//
//             if (query_result['search']['hits'].length > 0) {
//                 for (var x = 0; x < query_result['search']['hits'].length; x++) {
//                     result_html.push('<div class="blastResultBox ui-corner-all">')
//                     var hit = query_result['search']['hits'][x];
//
//                     result_html.push('<p>' + hit['num'] + ': ' + hit['description'][0]['id'] + '</p>');
//
//                     for (var y = 0; y < hit['hsps'].length; y++) {
//                         var hsp = hit['hsps'][y];
//                         result_html.push('<p>Hsp: ' + hsp['num'] + '</p>');
//                         result_html.push('<p><b>Bit Score: </b>' + hsp['bit_score'] + ' | <b>Hit Length: </b>' + hit['len'] + ' | <b>Gaps: </b>' + hsp['gaps'] + '</p>');
//                         result_html.push('<p><b>Score: </b>' + hsp['score'] + ' | <b>Evalue: </b>' + hsp['evalue'] + '</p>');
//                         //result_html.push('<p>'+  +'</p>');
//                         result_html.push('<hr/>');
//
//                         result_html.push('<div class="note">');
//                         result_html.push('<p class="blastPosition">Query from: ' + hsp['hit_from'] + ' to: ' + hsp['hit_to'] + ' Strand: ' + hsp['hit_strand'] + '</p>');
//                         result_html.push(alignment_formatter(hsp['qseq'].match(/.{1,100}/g), hsp['midline'].match(/.{1,100}/g), hsp['hseq'].match(/.{1,100}/g)));
//                         result_html.push('</div>');
//                     }
//                     result_html.push('</div>')
//                 }
//             } else {
//                 result_html.push('<p>No hits found</p>')
//             }
//
//
//         }
//
//
//         result_html.push('</fieldset>');
//
//     }
//     //$('#form').html('');
//     $('#result').html(result_html.join(' '));
// }

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

