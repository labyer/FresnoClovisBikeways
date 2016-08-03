var INSERT = true;
var APIKEY = "05390a57b6f6db9ded2151065b5ef1370d244d64";

// Leaflet map setup
var map = L.map('map', {
  center: [36.736971, -119.787852],
  zoom: 12
});

var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);

bikeways = $.ajax("https://raw.githubusercontent.com/labyer/FresnoClovisBikeways/master/Bikeways.json")

var parseData = function(data) {
  return JSON.parse(data);
};

// var plotRoutes = function(data) {
//   return _.each(data, function(i){
//     i.addTo(map);
//   });
// };

var testBikeways = "https://raw.githubusercontent.com/labyer/FresnoClovisBikeways/master/testBikeways.geojson"

$.ajax(testBikeways).done(function(data) {
  var parsedData = JSON.parse(data);
  routes = L.geoJson(parsedData, {
  });
  routes.addTo(map);
});

// var makeRoutes = function(data) {
//   return _.map(data, function(i){
//     return L.multiPolyline([i.LAT, i.LNG]);
//   });
// };
//
// var plotRoutes = function(data) {
//   return _.each(data, function(i){
//     i.addTo(map);
//   });
// };
//
// // bikeways.done(function(data) {
// //   var parsed = parseData(data);
// //   plotRoutes(parsed);
// //   //removeMarkers(markers);
// // });
//
// L.polyline(bikeways).addTo(map);




var lastClick = 0;

function startNewLine(rNum) {
	$("#map").addClass("pointing");
    var polyline = new line(rNum);
    routeDict[polyline.id] = polyline;
    routeDrawTooltip = new L.Tooltip(map);
    map.on('mousemove', _onMouseMove);
	map.on('click', addMarker);
    routeDrawTooltip.updateContent({text:"Click to add a start point to your route"});
    return polyline;
}

/* Ends the current line
 */
 function endLine(evt) {
	 dialog.dialog( "open" );
 }

function cancelLine(){
	stopRouteDraw();
}

function stopRouteDraw(){
	currentLine = null;
	routeDrawTooltip.dispose();
	map.removeEventListener('dblclick');
	map.off('mousemove', _onMouseMove);
	map.off('click', addMarker);
	$("#add-route").removeClass('icon-click');
	$("#map").removeClass("pointing");
}
/* Adds a marker to the current route
 * If a marker is clicked (simulates a double click) the route is ended
 */
function addMarker(evt) {

	//From http://stackoverflow.com/a/28610565/4047679
	if (lastClick >= (Date.now() - 20))
    	return;

	lastClick = Date.now();

    if (currentLine === null) {
	}
	else if (currentLine !== null) {

		var marker = new L.marker(evt.latlng, { draggable:true, icon:circleIcon });

		marker.on('dragend', function() {
			drawRoute(currentLine);
		});
		drawnRoute.addLayer(marker);
		currentLine.waypoints.push(marker);
		drawRoute(currentLine);

        if(currentLine.waypoints.length >= 1){
            routeDrawTooltip.updateContent({text:"Click to add a another point to your route"});
        }

        //Change message of the tooltip, and enable finishing route
        if(currentLine.waypoints.length >= 2){
			routeDrawTooltip.updateContent({text: 'Double-click on a point to finish drawing' });
			map.on("dblclick", endLine);
//			marker.on('click', endLine);
			marker.on("dblclick", endLine);
//			marker.on('contextmenu', endLine);
//			map.on('contextmenu', endLine);
			$("#save").show();
			$("#save").css({'display':'inline-block'});
		}

	}
}


function _onMouseMove (e) {
	var latlng = e.latlng;
	routeDrawTooltip.updatePosition(latlng);
}


/* Draws the route between a given set of waypoints
 * If there are at least 2 points then a request is sent to the directions api
 * which includes user-added waypoints
 * Those points are then added to the map
 */
function drawRoute(routeToDraw) {
	var defer = $.Deferred();
	if (routeToDraw.waypoints.length > 1 ) {
		var waypointsString = "";
		var pointsToDraw = [];

		for (i = 0; i < routeToDraw.waypoints.length - 1; i++) {
			var lat = routeToDraw.waypoints[i].getLatLng().lat;
			var lng = routeToDraw.waypoints[i].getLatLng().lng;
			waypointsString += lng + "," + lat + ";";
	  	}
	  	//accounts for omitting semi-colon
	  	var lastLat = routeToDraw.waypoints[routeToDraw.waypoints.length - 1].getLatLng().lat;
	  	var lastLng = routeToDraw.waypoints[routeToDraw.waypoints.length - 1].getLatLng().lng;

	  	waypointsString += lastLng + "," + lastLat;

		var directionUrl = 'https://api.mapbox.com/v4/directions/mapbox.walking/'+ waypointsString + '.json?access_token='+config.mapboxAccessToken;

		routeDict[routeToDraw.id].directionUrl = directionUrl;

		$.when($.get(directionUrl)
		).done( function (result) {
			var route = result.routes[0].geometry.coordinates;

			routeDict[routeToDraw.id].coordinates = route;
			pointsToDraw = route.map( function(coordinate) {
				return [coordinate[1], coordinate[0]]; //use this to switch lat and long
			});

			routeToDraw.polyline.setLatLngs(pointsToDraw);
			defer.resolve();
		}
		).fail( function (result) {
			//alert("there was an issue drawing the route"); //use for debugging
		});
 	}
 	return defer.promise();
 }



 // WAS IN HTML
 // Survey show and hide
 $(document).on('ready', function() {
     var counter = 0;
     $('#survey_form').on('load', function() {
         if (counter > 0) {
             $('#survey').addClass('hide');
             window.setTimeout(function() {
                 $('#survey').addClass('remove');
             }, 2000);
         } else {
             counter++;
         }
     });
 });

 //L.mapbox.accessToken = config.mapboxAccessToken;
 // Create a map in the div #map
 var map = L.map('map', {
     center: config.mapFocus,
     zoom: 11,
     minZoom : 4,
     maxzoom: 20,
     zoomControl :false
 });
 map.touchZoom.enable();
 L.control.zoom({position : 'bottomleft'}).addTo(map);

 // basemap
 var basemap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYWx0YXBsYW5uaW5nIiwiYSI6InhqNzQwRW8ifQ.mlA6eN3JguZL_UkEV9WlMA');
 basemap.addTo(map);

 //Empty to store markers after they are submitted
 var submittedData = L.geoJson(false, {
     onEachFeature: function (feature, layer) {
       layer.bindPopup('<b>' + feature.properties.name + '</b><br>' + feature.properties.description );
     }
 }).addTo(map);

//Bug appeared preventing ending of route drawing.
map.doubleClickZoom.disable();

 //	Do nothing on right-click
map.on('contextmenu', []);

//Adding the left Bar of icons as a leaflet control panel
var leftBar = L.control({position: 'topleft'});

//Inspiration: http://stackoverflow.com/a/25764322/4047679
//More insiration: http://stackoverflow.com/questions/18673860/defining-a-html-template-to-append-using-jquery

var hiddenInteractionButtonsTemplate = $('#hidden-interaction-buttons-template').html();

leftBar.onAdd = function(map) {
var div = L.DomUtil.create('div', '');
div.id = 'leftBar';
div.innerHTML = hiddenInteractionButtonsTemplate;
return div;
};

leftBar.addTo(map);

 //Empty to store drawn routes after they are submitted
 var submittedRoutes = new L.geoJson( false, {
     onEachFeature: function (feature, layer) {
         layer.bindPopup('<b>' + feature.properties.name + '</b><br>' + feature.properties.description );
     },
     style: function(feature) {
         /* Styles the submitted route drawing with the same properties as the drawn route as defined by line(id)  in definitions.js */
         return {
             color:feature.properties.color,
             weight: feature.properties.weight,
             opacity: feature.properties.opacity
         }
     }
 }).addTo(map);

 var drawnMarkers = new L.FeatureGroup();
map.addLayer(drawnMarkers);
 var drawnRoute = new L.FeatureGroup();

 var drawControl = new L.Control.Draw({
     draw : {
         polygon : false,
         polyline : false,
         rectangle : false,
         circle : false
     },
     edit : false,
     remove: false
 });

 markerDrawer =  new L.Draw.Marker(map, drawControl.options.marker);

 map.on('draw:created', function (e) {
     var layer = e.layer;
     drawnMarkers.addLayer(layer);
     dialog.dialog( "open" );
 });

/*#left-bar buttons*/
 /* button that triggers adding a marker */
 $("#add-point").on("click", function(event){
event.stopPropagation();
if(validInput===false){
 dialogGlobal.data('clicked','add-point').dialog( "open" );
     }
     else if(validInput){
 drawingPoints();
}
 });

/* button that triggers drawing a route */
 $("#add-route").on("click", function(event) {
event.stopPropagation();
     if(validInput===false){
 dialogGlobal.data('clicked','add-route').dialog( "open" );
}
     else if(validInput){
 drawingRoute();
     }
 });

$("#cancel").on("click", function(event){
event.stopPropagation();
if (routeDraw) {
         cancelLine();
     } else if (markerDraw) {
         markerDrawer.disable();
     };
     refreshLayer();
     $("#add-route").removeClass('icon-click');
     $("#add-point").removeClass('icon-click');
     markerDraw = false; routeDraw = false;
$("#cancel").hide();
$("#save").hide();
});

$("#save").on("click", function(event){
event.stopPropagation();
dialog.dialog("open");
});
//Only show when drawing happens
$("#cancel").hide();
$("#save").hide();

/*End #left-bar buttons*/

//Dialog of global user variables
dialogGlobal = $( "#dialogGlobal" ).dialog({
autoOpen: false,
height: 300,
     width: 350,
modal: true,
position: {
 my: "center center",
 at: "center center",
 of: "#map"
},
     buttons: [{
text: "Submit",
     click: function() {
   var checkedValues = dialogGlobalChecker(username.value);
   if (checkedValues.valid) {
   enteredUsername = "'"+username.value+"'";

   dialogGlobal.dialog("close");
   validInput = true;
   if ($(this).data('clicked')=='add-route') {
     drawingRoute();
   } else if ($(this).data('clicked')=='add-point') {
     drawingPoints();
   }
   } else {
             validInput = false;
             var index;
             for (index = 0; index < checkedValues.error.length; ++index) {
                 alert(checkedValues.error[index]);
    }
   }
     },
id: "globalAccept"
}],
close: function() {

},
//Hack to avoid "ENTER" leading to a new page...
open: function(){
 $("#dialogGlobal").keydown(function(e) {
   if (e.keyCode == $.ui.keyCode.ENTER) {
   $("#globalAccept").trigger("click");
   }
 });

}
});

$("#globalAccept").on("touchstart", function() {
 var checkedValues = dialogGlobalChecker(username.value);
 if (checkedValues.valid){
   enteredUsername = "'"+username.value+"'";

   dialogGlobal.dialog("close");
   validInput = true;
   if($(this).data('clicked')=='add-route'){
     drawingRoute();
   }
   else if($(this).data('clicked')=='add-point'){
     drawingPoints();
   }
 }
 else{
   validInput = false;
   var index;
   for(index = 0; index < checkedValues.error.length; ++index){
     alert(checkedValues.error[index]);
   }
 }
});

 /* dialog that appears after finishing a drawing */
   dialog = $( "#dialog" ).dialog({
       autoOpen: false,
       height: 300,
       width: 350,
       modal: true,
       position: {
         my: "center center",
         at: "center center",
         of: "#map"
     },
       buttons: [{
     text: "Save Input",
     click : function(){
     setData();
     },
     id: "dialogSaveInput"
   },
     {text: "Cancel",
     click: function() {
             if(markerDraw){
                 refreshLayer();
                 markerDrawer.enable();
             }
             dialog.dialog("close");
         }
       }],
       close: function() {
         if(markerDraw){
                 refreshLayer();
                 markerDrawer.enable();
         }

       }
       , open: function() {
           var _title = "Tell us about this";
           if (markerDraw){
               _title += " location";
           }
           else if (routeDraw){
               _title += " route";
           }
           $( "#dialog" ).dialog( "option", "title",_title);
     $( "#dialog" ).keydown(function(e) {
         if (e.keyCode == $.ui.keyCode.ENTER) {
         $("#dialogSaveInput").trigger("click");
         }
       });

       }
 });

function dialogGlobalChecker(name) {
     var error = [];
     var valid = true;
     if(name.length < 2) {
         error.push("Your name is too short.");
         valid = false;
     }
     return {valid: valid, error: error};
 }


 $(".ui-front").css('z-index','1005');

//Functions to initiate drawing
function drawingRoute(){
$("#add-route").addClass('icon-click');
$("#add-point").removeClass('icon-click');
$("#cancel").show();
markerDrawer.disable();
refreshLayer();
routeDraw = true;
markerDraw = false;
currentLine = startNewLine(routeNum);
map.addLayer(drawnRoute);
drawnRoute.addLayer(currentLine.polyline);
}
function drawingPoints(){
if(routeDraw){
cancelLine();
refreshLayer();
routeDraw = false;
$("#add-route").removeClass('icon-click');
$("#save").hide();
};
$("#add-point").addClass('icon-click');
$("#cancel").show();
markerDrawer.enable();
markerDraw = true;
}

function stopDrawingPoints(){
$("#add-point").removeClass('icon-click');
$("#cancel").hide();
markerDrawer.disable();
markerDraw = false;
}

function setData() {
 var enteredDescription = "'"+description.value+"'";
 //Convert the drawing to a GeoJSON to pass to the CartoDB sql database

 var drawing = "";

 if (routeDraw) {
     var submittedLine = currentLine.polyline.toGeoJSON();

     drawing = "'"+JSON.stringify(submittedLine.geometry)+"'";

     //To ensure that drawn routes remain on map after saving, with popup.

     submittedLine.properties.description = description.value;
     submittedLine.properties.name = username.value;
     submittedLine.properties.color = currentLine.polyline.options.color;
     submittedLine.properties.weight = currentLine.polyline.options.weight;
     submittedLine.properties.opacity= currentLine.polyline.options.opacity;

     submittedRoutes.addData(submittedLine);

     routeNum ++;
stopRouteDraw();
$("#cancel").hide();
$("#save").hide();
};

 if(markerDraw){
     drawnMarkers.eachLayer(function (layer) {
         //Convert the drawing to a GeoJSON to pass to the CartoDB sql database
         var newData = layer.toGeoJSON();
         drawing = "'"+JSON.stringify(newData.geometry)+"'";

         // Transfer drawing to the CartoDB layer
         newData.properties.description = description.value;
         newData.properties.name = username.value;
         submittedData.addData(newData);
     });
stopDrawingPoints();
 };

 refreshLayer();
 //Ensures that drawn routes stay on the map.
 if(routeDraw){submittedRoutes.eachLayer( function(layer){layer.addTo(map);});};

 //Construct the SQL query to insert data from the three parameters: the drawing, the input username, and the input description of the drawn shape
 var sql = "SELECT "+ config.cartoDBinsertfunction +"(";
     sql += drawing;
     sql += "," + enteredDescription;
     sql += "," + enteredUsername + ");";

 // console.log(sql); //For testing

 //Sending the data
 $.ajax({
     type: 'POST',
     url: 'https://' + config.cartoDBusername + '.carto.com/api/v2/sql',
     crossDomain: true,
     data: {"q":sql},
     dataType: 'json',
     success: function(responseData, textStatus, jqXHR) {
         console.log("Data saved");
     },
     error: function (responseData, textStatus, errorThrown) {
         console.log(responseData);
         console.log(errorThrown);
     }
   });

     dialog.dialog("close");
 };

 /*  QGIS layer*/
 var layerOrder = new Array();
 var feature_group = new L.featureGroup([]);
 function stackLayers() {
     for (index = 0; index < layerOrder.length; index++) {
         map.removeLayer(layerOrder[index]);
         map.addLayer(layerOrder[index]);
     }
 }
 function restackLayers() {
     for (index = 0; index < layerOrder.length; index++) {
         layerOrder[index].bringToFront();
     }
 }
 map.on('overlayadd', restackLayers);
 layerControl = L.control.layers({},{},{collapsed:false});

 // stackLayers();

 var deviceIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent);

/*Geolocator, activate only on mobile
http://stackoverflow.com/a/26577897/4047679*/
if (deviceIsMobile) {
L.control.locate({
 position: 'topright',
 icon: 'fa fa-crosshairs',
 locateOptions: {maxZoom: 20}
}).addTo(map);
}

 function refreshLayer() {

     if(markerDraw){
         map.removeLayer(drawnMarkers);
         drawnMarkers = new L.FeatureGroup();
     }else if(routeDraw){
         map.removeLayer(drawnRoute);
         drawnRoute = new L.FeatureGroup();
     }
 };
