/* ================= Set up background ==================== */
bg = {
    shown: new L.tileLayer(''), // the tile layer being shown
    initialise: function(){
	var rb = document.querySelectorAll('input[name="bgRadio"]:checked')[0]
	//console.log(rb);
	this.change(rb);
    },
    change: function(e){
        //console.log(e);
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
	//console.log(this.shown)
	map.addLayer(this.shown);
    }
}

/* ======================= Set up WMTS layers ========================= */
lyr = {
    name: null,
    dateTime: null,
    t: null,
    shown: new L.tileLayer(''), // the tile layer being shown
    update: function(i){
	map.removeLayer(this.shown);
	switch (lyr.name) {
        case 'imerg':
	    this.t = this.dateTime[i];
	    document.getElementById('dateTimeRangeLabel').innerHTML = "Date Time: " + this.t;
	    
	    //console.log(t)
	    this.shown = new L.tileLayer("http://wmts.waternumbers.com/imerg/tiles/"+this.t+"/{z}/{x}/{y}",
					 {dateTime: this.t,
	    				  maxNativeZoom: 3,
					  opacity: 0.9,
	    				  attribution: "NASA IMERG data & waternumbers",
	    				  pane: 'lyrPane',
	    				  options:{tileSize: 512}
					 });
	    break;
	}
	map.addLayer(this.shown);
    },
    change: function(){
        //console.log(e);
	//map.removeLayer(this.shown);
	const isOk = response => response.ok ? response.json() : Promise.reject(new Error('Failed to load data from server'))
	let e = document.querySelectorAll('input[name="lyrRadio"]:checked')[0];
	fetch('https://wmts.waternumbers.com/'+e.value+'/times')
	    .then(isOk)
	    .then(data => {
		this.dateTime = data;
		var doUpdate = false;
		// check layer is the same
		if(this.name != e.value){
		    this.name = e.value;
		    doUpdate = true;
		    this.legend(e.value);
		}
		// check time is available i is index in dateTime
		let i = this.dateTime.indexOf(this.t);
		if (i < 0){// will be -1 if missing
		    i = this.dateTime.length - 1;
		    doUpdate = true;
		}
		if(doUpdate){
		    this.update(i);
		}
		
	    }).catch(error => console.error(error));
	window.setTimeout(function(){lyr.change()},30000);
    },
    legend: function(v){
	ustr = '"https://wmts.waternumbers.com/'+v+'/legend"';
	pstr = '<a href='+ustr+' target=_blank><img src=' + ustr + ' alt="No Legend Available"></a>';
	document.getElementById('legendLabel').innerHTML = 'Legend: ' + v;
	document.getElementById('legend').innerHTML = pstr;
    }
}


/* ========================================== Set up marker layers ========================== */
var mrk = {
    apiUrl: "https://wmts.waternumbers.com/dhm/",
    icon: {
	"u": new L.icon({
	    iconUrl: "im/warning_0.svg",
	    iconSize: [24, 28],iconAnchor: [12, 28],popupAnchor: [0, -25]}),
	"n": new L.icon({
	    iconUrl: "im/warning_0.svg",
	    iconSize: [24, 28],iconAnchor: [12, 28],popupAnchor: [0, -25]}),
	"d": new L.icon({
	    iconUrl: "im/warning_1.svg",
	    iconSize: [24, 28],iconAnchor: [12, 28],popupAnchor: [0, -25]}),
	"w": new L.icon({
	    iconUrl: "im/warning_2.svg",
	    iconSize: [24, 28],iconAnchor: [12, 28],popupAnchor: [0, -25]})},
    waterLevel: L.geoJSON(
	{type: 'FeatureCollection',
         features: []
	},{
	    filter: function(feature, layer) {
		return feature.properties.variable=="wl";
	    },
	    // add correct markers
	    pointToLayer: function (feature, latlng) {
		if (feature.properties && feature.properties.name &&
		    feature.properties.state) {
		    return L.marker(latlng,{
			icon: mrk.icon[String(feature.properties.state)],
			riseOnHover: true,
			title: feature.properties.name
		    });
		    
		}
	    },
	    // add label and onclick event
	    onEachFeature: function(feature, layer) {
		// add onclick event
		if (feature.properties && feature.properties.uid) {
		    ustr = '"' + mrk.apiUrl +'plot/'+feature.properties.uid +'"'; // url of image
		    pstr = '<h4>' + feature.properties.name +'</h4>';
		    pstr = pstr + '<a href='+ustr+' target=_blank><img src=' + ustr + ' alt="No Data Available"></a>';
		    layer.bindPopup(pstr);
		}
   	    }
	    
	}),
    precip: L.geoJSON(
	{type: 'FeatureCollection',
         features: []
	},{
	    filter: function(feature, layer) {
		return feature.properties.variable=="p";
	    },
	    // add correct markers
	    pointToLayer: function (feature, latlng) {
		if (feature.properties && feature.properties.name &&
		    feature.properties.state) {
		    return L.marker(latlng,{
			riseOnHover: true,
			title: feature.properties.name
		    });
		    
		}
	    },
	    // add label and onclick event
	    onEachFeature: function(feature, layer) {
		// add onclick event
		if (feature.properties && feature.properties.uid) {
		    ustr = '"' + mrk.apiUrl +'plot/'+feature.properties.uid +'"'; // url of image
		    pstr = '<h4>' + feature.properties.name +'</h4>';
		    pstr = pstr + '<a href='+ustr+' target=_blank><img src=' + ustr + ' alt="No Data Available"></a>';
		    layer.bindPopup(pstr);
   		}
	    }
	}),
    change: function(){
	const isOk = response => response.ok ? response.json() : Promise.reject(new Error('Failed to load data from server'))
	
	fetch(this.apiUrl +"stations") //test_data/stations.json')
	    .then(isOk) // <= Use `isOk` function here
	    .then(data => {
		this.precip.clearLayers();
		this.precip.addData(data);
		this.waterLevel.clearLayers();
		this.waterLevel.addData(data);
	    })
	    .catch(error => console.error("station loading error " + error))
	window.setTimeout(function(){mrk.change()},30000);

    },
    update: function(e){
	if(e.checked){
	    map.addLayer(mrk[e.value])
	}else{
	    map.removeLayer(mrk[e.value])
	}
	//console.log(e)
    },
    initialise: function(){
	var rb = document.querySelectorAll('input[name="mrkInput"]:checked');
	console.log(rb)
	rb.forEach(function(z){
	    mrk.update(z);
	});
	mrk.change()
    }
};

/* Code to initialise the map */
var map = L.map('map',{
    zoom: 7,
    maxZoom: 16,
    center: [28.3949, 84.1240],
    layers: [bg.shown, lyr.shown],//,wms.shown,markers.shown],
    zoomControl: false
}) ;
map.createPane('lyrPane');
map.getPane('lyrPane').style.zIndex = 300;

map.on('click', function(e) {        
    if( lyr.name ){
	var popLocation= e.latlng;	
        console.log(popLocation)
	switch (lyr.name) {
        case 'imerg':
	    var ustr = "http://wmts.waternumbers.com/imerg/plot/" + popLocation.lng + "/" + popLocation.lat ;
	    var pstr = '<a href='+ustr+' target=_blank><img src=' + ustr + ' alt="No Data Available"></a>';
	}
	var popup = L.popup()
	    .setLatLng(popLocation)
            .setContent(pstr) //'<p>Hello world!<br />This is a nice popup.</p>')
            .openOn(map);        
    }
});
      


bg.initialise();
lyr.change();//initialise();
mrk.initialise();
//var rb = document.querySelectorAll('input[name="mrkInput"]:checked')[0]
//console.log(rb);
