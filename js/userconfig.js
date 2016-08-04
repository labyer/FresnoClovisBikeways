/*
 * Central repository of options to change when forking this map!
 */

var config = {
	// Set Map Bounds & point map is centered around
	mapFocus : [36.804736, -119.755339],
	// Mapbox access token & key for basemap
	mapboxAccessToken : 'pk.eyJ1IjoiYWx0YXBsYW5uaW5nIiwiYSI6InhqNzQwRW8ifQ.mlA6eN3JguZL_UkEV9WlMA',
    // username, insert function on cartodb, and cartodb tablename (see also /cartoDB_functions)
	cartoDBusername : 'davidpollard',
	cartoDBinsertfunction : 'insert_bikeways_data',
	walkthroughWelcome: "<p>This webmap allows you to submit input on where infrastructure can be improved by drawing on the map!</p>"
};
