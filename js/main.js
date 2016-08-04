
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

        // L.mapbox.accessToken = config.mapboxAccessToken;
        // Create a map in the div #map
        var map = L.map('map', {
            center: config.mapFocus,
            zoom: 12,
            minZoom : 10,
            maxzoom: 20,
            zoomControl: false
        });
        map.touchZoom.enable();
        L.control.zoom({position : 'bottomleft'}).addTo(map);

        // basemap
        var basemap = L.tileLayer('https://api.mapbox.com/styles/v1/fresnoclovisbikeways/cirgcbfqa0001ginqv2tizy9b/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZnJlc25vY2xvdmlzYmlrZXdheXMiLCJhIjoiY2lyZjZnaTdkMDA4NWc1bmtyYjkwdWNxMCJ9.MgEvAEqv0bAbseOI6cCCOg');
        basemap.addTo(map);

        //Empty to store markers after they are submitted
        var submittedData = L.geoJson(false, {
            onEachFeature: function (feature, layer) {
              layer.bindPopup('<b>' + feature.properties.description );
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
                layer.bindPopup('<b>' + feature.properties.description );
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
        /* button that triggers adding a destination */
        $("#add-point-button").on("click", function(event){
			       event.stopPropagation();
			       if(validInput===false){
			   	        dialogGlobal.data('clicked','add-point-button').dialog( "open" );
              }
              else if(validInput){
				            drawingPoints();
			        }
        });



        /* button that triggers adding a hazard */
        $("#add-hazard-button").on("click", function(event){
			       event.stopPropagation();
			       if(validInput===false){
			   	        dialogGlobal.data('clicked','add-hazard-button').dialog( "open" );
              }
              else if(validInput){
				            drawingPoints();
			        }
        });

		/* button that triggers drawing a route */
        $("#add-route-button").on("click", function(event) {
			event.stopPropagation();
            if(validInput===false){
				dialogGlobal.data('clicked','add-route-button').dialog( "open" );
			}
            else if(validInput){
				drawingRoute();
            }
        });

		$("#cancel-drawing-button").on("click", function(event){
			event.stopPropagation();
			if (routeDraw) {
                cancelLine();
            } else if (markerDraw) {
                markerDrawer.disable();
            };
            refreshLayer();
            $("#add-route-button").removeClass('icon-click');
            $("#add-point-button").removeClass('icon-click');
            $("#add-hazard-button").removeClass('icon-click');
            markerDraw = false; routeDraw = false;
			$("#cancel").hide();
			$("#save").hide();
		});

		$("#save").on("click", function(event){
			event.stopPropagation();
			dialog.dialog("open");
		});
		//Only show when drawing happens
    $("#cancel-drawing-button").hide();
		$("#save-drawing-button").hide();

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
					if ($(this).data('clicked')=='add-route-button') {
						drawingRoute();
					} else if ($(this).data('clicked')=='add-point-button') {
						drawingPoints();
					} else if($(this).data('clicked')=='add-hazard-button'){
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
					if($(this).data('clicked')=='add-route-button'){
						drawingRoute();
					}
					else if($(this).data('clicked')=='add-point-button'){
						drawingPoints();
					}
          else if($(this).data('clicked')=='add-hazard-button'){
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
    $("#add-route-button").addClass('icon-click');
		$("#add-point-button").removeClass('icon-click');
    $("#add-hazard-button").removeClass('icon-click');
		$("#cancel-drawing-button").show();
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
      $("#add-point-button").removeClass('icon-click');
      $("#add-hazard-button").removeClass('icon-click');
			$("#save-drawing-button").hide();
		};
    $("#add-point-button").addClass('icon-click');
    $("#add-hazard-button").removeClass('icon-click');
		$("#cancel-drawing-button").show();
		markerDrawer.enable();
		markerDraw = true;
	}

  function drawingHazards(){
      if(routeDraw){
        cancelLine();
        refreshLayer();
        routeDraw = false;
        $("#add-point-button").removeClass('icon-click');
        $("#add-hazard-button").removeClass('icon-click');
        $("#save-drawing-button").hide();
      };
      $("#add-hazard-button").addClass('icon-click');
      $("#add-point-button").removeClass('icon-click');
      $("#cancel-drawing-button").show();
      markerDrawer.enable();
      markerDraw = true;
    }


  function stopDrawingPoints(){
    $("#add-point-button").removeClass('icon-click');
    $("#add-hazard-button").removeClass('icon-click');
		$("#cancel-drawing-button").hide();
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
      $("#cancel-drawing-button").hide();
			$("#save-drawing-button").hide();
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
