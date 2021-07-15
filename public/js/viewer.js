/* ================= Set up background ==================== */
bg = {
    shown: new L.tileLayer(''), // the tile layer being shown
    initialise: function(){
	var rb = document.querySelectorAll('input[name="bgRadio"]:checked')[0]
	console.log(rb);
	this.change(rb);
    },
    change: function(e){
        console.log(e);
        map.removeLayer(this.shown);
        switch (e.value) {
        case 'osmbw':
	    this.shown = new L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
                                  {"maxZoom": 17,
                                   "attribution": "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, &copy; <a href='https://cartodb.com/attributions'>CartoDB</a>"
                                  });
	    break;
	case 'osmtopo':
	    this.shown = new L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
                                    {"maxZoom": 17,
				     "attribution": "Map data: &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, <a href='http://viewfinderpanoramas.org'>SRTM</a> | Map style: &copy; <a href='https://opentopomap.org'>OpenTopoMap</a> (<a href='https://creativecommons.org/licenses/by-sa/3.0/'>CC-BY-SA</a>)"
				    });
	    break;
	case "esri":
	    this.shown = new L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
					 {"attribution": "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"});
	    break;
	}
	console.log(this.shown)
	map.addLayer(this.shown);
    }
}

/* ======================= Set up WMS layers ========================= */
lyr = {
    shown: new L.tileLayer(''), // the tile layer being shown
    initialise: function(){
	var rb = document.querySelectorAll('input[name="lyrRadio"]:checked')[0]
	console.log(rb);
	this.change(rb);
    },
    change: function(e){
        console.log(e);
	map.removeLayer(this.shown);
        switch (e.value) {
        case 'nexrad':
	    this.shown = new L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi",
					   {
					       layers: 'nexrad-n0r-900913',
					       format: 'image/png',
					       transparent: true,
					       attribution: "Weather data © 2012 IEM Nexrad",
					       pane: 'lyrPane'
					   });
	    break;
	case 'bluesq':
	    this.shown = new L.tileLayer.wms("https://environment.data.gov.uk/arcgis/services/EA/BlueSquareGrid/MapServer/WMSServer",
					   {
					       layers: 'Blue_Square_Grid',
					       format: 'image/png',
 					       transparent: true,
					       attribution: "Environment Agency Blue Square",
					       pane: 'lyrPane'
					   });
	    break;
	}
	console.log(this.shown)
	map.addLayer(this.shown);
    }
}

/* ======================= Set up point markers ========================= */
// markers object and actions
eaStations = {
    shown: L.geoJSON(null, {
	pointToLayer: function (feature, latlng) {
	    switch (feature.properties.warning_class) {
	    case "u": return L.circleMarker(latlng, {color: "grey"});
	    case "n": return L.circleMarker(latlng, {color: "black"});
	    case "w": return L.circleMarker(latlng, {color: "orange"});
	    case "d": return L.circleMarker(latlng, {color: "red"});
	    }
	},
	onEachFeature: function(feature, layer) {
	    // does this feature have a property named popupContent?
	    if (feature.properties && feature.properties.url) {
		layer.bindPopup(feature.properties.url);
	    }
	}
    }),
    initialise: function(){
	var rb = document.getElementById("mrkEAStations");
	console.log("ea markers");
	console.log(rb);
	this.change(rb);
    },
    change: function(e){
	if(e.checked){
	    console.log("ea_markers Checked");
	    const isOk = response => response.ok ? response.json() : Promise.reject(new Error('Failed to load data from server'))

	    fetch('./test_data/demo.geojson') //test_data/stations.json')
		.then(isOk) // <= Use `isOk` function here
		.then(data => {
		    console.log(data);
		    this.shown.addData(data.features);
		})
		.catch(error => console.error(error))
	}else{
	    console.log("ea_markers unhecked");
	    this.shown.clearLayers();
	}
	// this.shown.clearLayer();
	//this.shown.addData(data);
    }
}


/* Code to initialise the map */
var map = L.map('map',{
    zoom: 12,
    maxZoom: 16,
    center: [54.44780,-3.19830],
    layers: [bg.shown, eaStations.shown],//,wms.shown,markers.shown],
    zoomControl: false
}) ;
map.createPane('lyrPane');
map.getPane('lyrPane').style.zIndex = 300;
bg.initialise();
lyr.initialise();
eaStations.initialise();
