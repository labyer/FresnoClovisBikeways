/* global variables which store information about
 * current route and all routes
 */
var routeNum = 0;
var currentLine = null;
var markerDrawer = null;
var routeDict = {};
var colors = ['#4AA0D3'];
var routeDraw = false,
	markerDraw = false,
	hazardDraw = false,
	validInput = false;
var routeDrawTooltip = null;


var zip= 0,
	enteredUsername ="";


/* constructor for a new line object */
function line(id) {
	this.id = id;
	if (colors[id]) {
		var lineColor = '#1b75bb';
	} else {
		var lineColor = "#1b75bb";
	}
	this.polyline = L.polyline([], { color:lineColor, weight: 5.5, opacity: 0.8 });
	this.waypoints = [];
}

var circleIcon = L.icon({
    iconUrl: 'img/icon2.png',
    iconSize: [20, 20]
});


var POIMarkerIcon = L.icon({
    iconUrl: 'img/POIMarker.png',
		shadowUrl: 'img/marker-shadow.png',
		iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var WarningMarkerIcon = L.icon({
    iconUrl: 'img/WarningMarkerIcon.png',
		shadowUrl: 'img/marker-shadow.png',
		iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
