function startGIS(jsonArray) {

    var filtered_data_donor = [];
    var filtered_data_breeder = [];
    jQuery('#status').html('');
    for (i = 0; i < jsonArray.length; i++) {
        if (jsonArray[i]['data']['BreederAddress'] != undefined) {
            if (jsonArray[i]['data']['BreederAddress']['location']['centre'] != undefined) {
                filtered_data_breeder.push(jsonArray[i]);
            }
        }
        if (jsonArray[i]['data']['DonorAddress'] != undefined) {
            if (jsonArray[i]['data']['DonorAddress']['location']['centre'] != undefined) {
                filtered_data_donor.push(jsonArray[i]);
            }
        }
    }
    // removeTable();
    produceTable(jsonArray);
    displayYRLocations_new(filtered_data_breeder, 'Breeder');
    displayYRLocations_new(filtered_data_donor, 'Donor');
    renderLegend();
}

function produceTable(data) {
    yrtable = jQuery('#resultTable').DataTable({
        data: data,
        "columns": [
            {data: "data.dwc:recordNumber", title: "Record Number", "sDefaultContent": ""},
            {data: "data.accession", title: "Accession", "sDefaultContent": ""},
            {data: "data.ploidy", title: "Ploidy", "sDefaultContent": ""},
            {data: "data.dwc:scientificName", title: "Scientific Name", "sDefaultContent": ""},
            {data: "data.dwc:genus", title: "Genus", "sDefaultContent": ""},
            {data: "data.dwc:year", title: "Year", "sDefaultContent": ""},
            {data: "data.dwc:vernacularName", title: "Vernacular Name", "sDefaultContent": ""},
            {
                title: "Donor",
                "render": function (data, type, full, meta) {
                    var donorInfo = '';
                    if (full['data']['DonorAddress'] !== undefined && full['data']['DonorAddress'] !== "undefined") {
                        if (full['data']['DonorAddress']['Address'] !== undefined && full['data']['DonorAddress']['Address'] !== "undefined") {
                            donorInfo = '<span class=\"newstyle_link\"> ' + full['data']['DonorAddress']['Address']['name'] + '<br/>'
                                + full['data']['DonorAddress']['Address']['addressLocality'] + '<br/>'
                                + full['data']['DonorAddress']['Address']['addressCountry'] + '<br/>'
                                + full['data']['DonorAddress']['Address']['postalCode'] + '</span>';
                        }
                    }
                    return donorInfo;
                }
            },
            {
                title: "Breeder",
                "render": function (data, type, full, meta) {
                    var breederInfo = '';
                    if (full['data']['BreederAddress'] !== undefined && full['data']['BreederAddress'] !== "undefined") {
                        if (full['data']['DonorAddress']['Address'] !== undefined && full['data']['DonorAddress']['Address'] !== "undefined") {
                            breederInfo = '<span class=\"newstyle_link\"> ' + full['data']['BreederAddress']['Address']['name'] + '<br/>'
                                + full['data']['BreederAddress']['Address']['addressLocality'] + '<br/>'
                                + full['data']['BreederAddress']['Address']['addressCountry'] + '<br/>'
                                + full['data']['BreederAddress']['Address']['postalCode'] + '</span>';
                        }
                    }
                    return breederInfo;
                }
            },

            {
                title: "View Record",
                "render": function (data, type, full, meta) {
                    if (full['data']['order_link'] !== undefined) {
                        return '<a target="_blank" href="https://www.seedstor.ac.uk/search-infoaccession.php?idPlant=' + full['data']['dwc:recordNumber'] + '">View</a>';
                    }
                    else {
                        return '';
                    }
                }
            },

            {
                title: "Order",
                "render": function (data, type, full, meta) {
                    if (full['data']['order_link'] !== undefined) {
                        return '<a target="_blank" href="' + full['data']['order_link']['url'] + '">Order</a>';
                    }
                    else {
                        return '';
                    }
                }
            }
        ]

    });

    jQuery('#resultTable tbody').on('click', 'td', function () {
        var cellIdx = yrtable.cell(this).index();
        var columnIdx = cellIdx['column'];
        var rowIdx = cellIdx['row'];
        var json = yrtable.row(rowIdx).data();
        if (columnIdx == 7) {
            if (json['data']['DonorAddress'] != undefined) {
                if (json['data']['DonorAddress']['location']['centre'] != undefined) {
                    var la = json['data']['DonorAddress']['location']['centre']['latitude'];
                    var lo = json['data']['DonorAddress']['location']['centre']['longitude'];
                    map.setView([la, lo], 16, {animate: true});
                }
            }


        } else if (columnIdx == 8) {
            if (json['data']['BreederAddress'] != undefined) {
                if (json['data']['BreederAddress']['location']['centre'] != undefined) {
                    var la = json['data']['BreederAddress']['location']['centre']['latitude'];
                    var lo = json['data']['BreederAddress']['location']['centre']['longitude'];
                    map.setView([la, lo], 16, {animate: true});
                }
            }

        }
        $(window).scrollTop($('#map').offset().top - 90);

    });

    jQuery('#resultTable').on('search.dt', function () {
        removePointers();
        var searchData = yrtable.rows({filter: 'applied'}).data().toArray();
        var search_data_breeder = [];
        var search_data_donor = [];
        for (i = 0; i < searchData.length; i++) {
            if (searchData[i]['data']['BreederAddress'] != undefined) {
                if (searchData[i]['data']['BreederAddress']['location']['centre'] != undefined) {
                    search_data_breeder.push(searchData[i]);
                }
            }
            if (searchData[i]['data']['DonorAddress'] != undefined) {
                if (searchData[i]['data']['DonorAddress']['location']['centre'] != undefined) {
                    search_data_donor.push(searchData[i]);
                }
            }
        }
        displayYRLocations_new(search_data_breeder, 'Breeder');
        displayYRLocations_new(search_data_donor, 'Donor');
    });


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

function removePointers() {
    map.removeLayer(markersGroup);
    // if (pie_view) {
    //     markersGroup = new L.MarkerClusterGroup({
    //         maxClusterRadius: 2 * 30,
    //         iconCreateFunction: defineClusterIcon
    //     });
    // }
    // else {
    markersGroup = new L.MarkerClusterGroup();
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

function ukcpvs_only() {
    var column = yrtable.column(2);
    column.search('^((?!Unknown).)*$', true, false).draw();
}


function displayYRLocations_new(array, type) {
    for (i = 0; i < array.length; i++) {
        var la = '';
        var lo = '';
        var country = '';
        var town = '';
        var name = '';


        if (type === 'Donor') {
            la = array[i]['data']['DonorAddress']['location']['centre']['latitude'];
            lo = array[i]['data']['DonorAddress']['location']['centre']['longitude'];

            if (array[i]['data']['DonorAddress']['Address'] != undefined) {
                if (array[i]['data']['DonorAddress']['Address']['addressCountry'] != undefined) {
                    country = array[i]['data']['DonorAddress']['Address']['addressCountry'];
                }
                if (array[i]['data']['DonorAddress']['Address']['addressLocality'] != undefined) {
                    town = array[i]['data']['DonorAddress']['Address']['addressLocality'];
                }
                if (array[i]['data']['DonorAddress']['Address']['name'] != undefined) {
                    name = array[i]['data']['DonorAddress']['Address']['name'];
                }
            }
        } else if (type === 'Breeder') {
            la = array[i]['data']['BreederAddress']['location']['centre']['latitude'];
            lo = array[i]['data']['BreederAddress']['location']['centre']['longitude'];

            if (array[i]['data']['BreederAddress']['Address'] != undefined) {
                if (array[i]['data']['BreederAddress']['Address']['addressCountry'] != undefined) {
                    country = array[i]['data']['BreederAddress']['Address']['addressCountry'];
                }
                if (array[i]['data']['BreederAddress']['Address']['addressLocality'] != undefined) {
                    town = array[i]['data']['BreederAddress']['Address']['addressLocality'];
                }
                if (array[i]['data']['BreederAddress']['Address']['name'] != undefined) {
                    name = array[i]['data']['BreederAddress']['Address']['name'];
                }
            }
            popup_note = '<h5> Breeder Information</h5>' + popup_note;

        }

        var popup_note = '<b>Record Number: </b>' + array[i]['data']['dwc:recordNumber'] + '<br/>'
            + '<b>Accession: </b>' + array[i]['data']['accession'] + '<br/>'
            + '<b>Genus: </b>' + array[i]['data']['dwc:genus'] + '<br/>'
            + '<b>Scientific Name: </b>' + array[i]['data']['dwc:scientificName'] + '<br/>'
            + '<b>Year: </b>' + array[i]['data']['dwc:year'] + '<br/>'
            + '<b>Vernacular Name: </b>' + array[i]['data']['dwc:vernacularName'] + '<br/>'
            + '<b>Ploidy: </b>' + array[i]['data']['ploidy'] + '<br/>'
            + '<b>Organisation: </b>' + name + '<br/>'
            + '<b>Country: </b>' + country + '<br/>'
            + '<b>Town: </b>' + town + '<br/>'
            + '<a target="_blank" href="https://www.seedstor.ac.uk/search-infoaccession.php?idPlant=' + array[i]['data']['dwc:recordNumber'] + '">View record </a>' + ' | '
            + '<a target="_blank" href="' + array[i]['data']['order_link']['url'] + '"> Order from SeedStor</a><br/>'
        ;
        addPointer(la, lo, '<h5> ' + type + ' Information</h5>' + popup_note, type);
    }
    map.addLayer(markersGroup);


}


function addPointer(la, lo, note, type) {

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
    if (type === 'Breeder') {
        markerLayer = L.marker([la, lo], {icon: greenIcon}).bindPopup(note);
    }
    else {
        markerLayer = L.marker([la, lo]).bindPopup(note);
    }
    // markers.push(markerLayer);
    markersGroup.addLayer(markerLayer);

}


function removeTable() {
    jQuery('#resultTable').dataTable().fnDestroy();
    jQuery('#tableWrapper').html('<table id="resultTable"></table>');
}

function popup(msg) {
    L.popup()
        .setLatLng([52.621615, 8.219])
        .setContent(msg)
        .openOn(map);
}

function mapFitBounds(list) {
    map.fitBounds(list);
}

function randomNumberFromInterval(min, max) {
    return Math.random() * (max - min + 1) + min;
}


function serializeXmlNode(xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
    }
    else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
    }
    return "";
}

function renderLegend() {
    jQuery('#legend').show();
    jQuery('#legend').html('');
    // if (pie_view) {
    var metajson = {
        "lookup": {
            "1": "Breeder",
            "2": "Donor"
        }
    };

    var data = d3.entries(metajson.lookup),
        legenddiv = d3.select('#legend');

    var heading = legenddiv.append('div')
        .classed('legendheading', true)
        .text("Marker types");

    var legenditems = legenddiv.selectAll('.legenditem')
        .data(data);

    legenditems
        .enter()
        .append('div')
        .attr('class', function (d) {
            return 'lengend-' + d.key;
        })
        .classed({'legenditem': true})
        .text(function (d) {
            return d.value;
        });
    // }
}


function checkFileBox(div_id) {
    if (document.getElementById(div_id).checked) {
        bam_list.push(div_id);
        console.log("add:" + div_id);
    } else {
        bam_list.splice(bam_list.indexOf(div_id), 1);
        console.log("remove:" + div_id);
    }

}

