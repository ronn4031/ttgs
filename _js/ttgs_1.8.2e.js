/**
 * @author Nicholas Ronnei
 * Special Thanks to:
 * Giri Jeedigunta (http://thewebstorebyg.wordpress.com/) Visit for great tutorials on maps
 * Tobias Bieniek (https://github.com/Turbo87) for his wonderful jQuery sidebar!
 */


$.fn.sidebar = function() {
    var $sidebar = this;
    var $tabs = $sidebar.children('.sidebar-tabs').first();
    var $container = $sidebar.children('.sidebar-content').first();

    $sidebar.find('.sidebar-tabs > li > a').on('click', function() {
        var $tab = $(this).closest('li');

        if ($tab.hasClass('active'))
            $sidebar.close();
        else
            $sidebar.open(this.hash.slice(1), $tab);
    });

    $sidebar.open = function(id, $tab) {
        if (typeof $tab === 'undefined')
            $tab = $tabs.find('li > a[href="#' + id + '"]').parent();

        // hide old active contents
        $container.children('.sidebar-pane.active').removeClass('active');

        // show new content
        $container.children('#' + id).addClass('active');

        // remove old active highlights
        $tabs.children('li.active').removeClass('active');

        // set new highlight
        $tab.addClass('active');

        $sidebar.trigger('content', { 'id': id });

        if ($sidebar.hasClass('collapsed')) {
            // open sidebar
            $sidebar.trigger('opening');
            $sidebar.removeClass('collapsed');
        }
    };

    $sidebar.close = function() {
        // remove old active highlights
        $tabs.children('li.active').removeClass('active');

        if (!$sidebar.hasClass('collapsed')) {
            // close sidebar
            $sidebar.trigger('closing');
            $sidebar.addClass('collapsed');
        }
    };

    return $sidebar;
};

var sidebar = $('#sidebar').sidebar();

(function(mapDemo, $) {
    mapDemo.Directions = (function() {
        function _Directions() {
            var map, autoSrc, userPos, parkDest, userMarker,
                directionsService, directionsRenderer, geocoder,

            ////////////////////
            // Testing for DirectionsRenderer
                userPos = new google.maps.LatLng(44.944664, -93.181506),
            // TODO Remove this section of code before roll-out
            ////////////////////

            // Caching the Selectors
                $Selectors = {
                    mapCanvas: $('#mapCanvas')[0],
                    dsResults: $('#dsResults'),
                    dsInputs: $('#dsInputs'),
                    origin: $('#origin'),
                    dirList: $('#dirList'),
                    gpsBtn: $('#useGPSBtn'),
                    resetBtn: $('#resetBtn'),
                    getDirBtn: $('#gd-btn'),
                    newLocation: $('#newLoaction')

                },

                geocodeSetup = function() {
                    geocoder = new google.maps.Geocoder;
                },
                //autoCompleteSetup = function() {
                //    //autoSrc = new google.maps.places.Autocomplete(document.querySelector("#origin"));
                //    autoSrc = new google.maps.places.Autocomplete(document.getElementById("origin"));
                //    autoSrc.bindTo('bounds', map);
                //    //google.maps.event.addListener(autoSrc, 'place_changed', function() {
                //    //    var place = autoSrc.getPlace();
                //    //    userPos = place.geometry.location;
                //    //    setUserLocation();
                //    //    $Selectors.origin.val(place.formatted_address);
                //    //
                //    //
                //    //});
                //}, // autoCompleteSetup Ends


            //trafficSetup = function() {
            //	// Creating a Custom Control and appending it to the map
            //	var controlDiv = document.createElement('div'),
            //		controlUI = document.createElement('div'),
            //		trafficLayer = new google.maps.TrafficLayer();
            //
            //	$(controlDiv).addClass('gmap-control-container').addClass('gmnoprint');
            //	$(controlUI).text('Traffic').addClass('gmap-control');
            //	$(controlDiv).append(controlUI);
            //
            //	// Traffic Btn Click Event
            //	google.maps.event.addDomListener(controlUI, 'click', function() {
            //		if (typeof trafficLayer.getMap() == 'undefined' || trafficLayer.getMap() === null) {
            //			jQuery(controlUI).addClass('gmap-control-active');
            //			trafficLayer.setMap(map);
            //		} else {
            //			trafficLayer.setMap(null);
            //			jQuery(controlUI).removeClass('gmap-control-active');
            //		}
            //	});
            //	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
            //}, // trafficSetup Ends


                // Define all arrays
                parkInfo = [
                    ['Minnesota Valley National Wildlife Refuge', 'The Refuge has many sections along its 99 miles of the Minnesota River. Two access points are easy via transit: the Bloomington Visitor Center and the Bass Ponds. Both of these are within the Long Meadow Lake Unit. Great places to see wildlife.', '952-854-5900', '3815 American Blvd E, Bloomington, MN, 55425', 'http://goo.gl/Hxg9If', '44.82883648', '-93.23845108'],
                    ['Battle Creek Regional Park', 'Hiking, biking, and ski trails, sports areas, and an off-leash dog area. Oak woods, old fields, creek, and second growth woodlands. Great birding opportunities.\r\n', '612-748-2500', 'Point Douglas Rd, St. Paul, MN, 55106', 'http://goo.gl/6KUA9b', '44.93510263', '-93.01953334'],
                    ['Bruce Vento Nature Sanctuary', 'It was the site of the North Star Brewery in the mid-19th century, and subsequently an industrial area. The area was transformed into a park in 2005. Bald eagles, redtail hawks, and turkey vultures frequent the area. A starting point for the Swede Hollow trail.', 'N/A', '4th St E, St. Paul, MN, 55106', 'http://goo.gl/z2C3uB', '44.94677779', '-93.0503428'],
                    ['Como Regional Park', 'This park is a major urban destination featuring hiking trails, paddle boat rental, zoo, gardens, and an amusement park. The Marjorie McNeely Conservatory is on the National Register of Historic Places.', '651-487-8201', '1151 Como Avenue, St. Paul, MN, 55108', 'http://goo.gl/bXOGK3', '44.9808264', '-93.1510696'],
                    ['Crosby Farms Regional Park', 'The park is named after Thomas Crosby, who established a farm on the site in 1858. A succession of families farmed the land until it became a park in 1962. This wild area now serves an important role in protecting the biodiversity along the Mississippi River. The park includes two lakes, several walking trails, and scenic views of the river. It is a great area for bird watching.\r\n', '651-632-5111', '2595 Crosby Farm Road, St. Paul, MN, 55116', 'http://goo.gl/EXUotM', '44.89991942', '-93.14997075'],
                    ['Elm Creek Park Reserve', 'Large park with rolling prairies, lakes, and woodlands. The Eastman Nature Center offers programs. The Pierre Bottineau House has exhibits on the famed voyageur. Board the train with your bike, then ride the three miles to the park from the Anoka station.', '763-694-7894', '12400 James Deane Parkway, Maple Grove, MN, 55369', 'http://goo.gl/Lcy2vW', '45.16734448', '-93.4392225'], ['Fort Snelling State Park', 'An urban wilderness located at the historically strategic juncture of the Minnesota and Mississippi Rivers. Great for outdoor fun in summer and winter.', '612-725-2389', 'Lakeview Avenue, St. Paul, MN, 55120', 'http://goo.gl/D60Cqg', '44.8412294', '-93.20249379'],
                    ['Hyland Lake Park Reserve', 'Large park offering prairie and woodland landscapes, access to Hyland Lake, biking and hiking trails, winter activities, and the Richardson Nature Center.', '763-694-7687', '10145 Bush Lake Rd, Bloomington, MN, 55438', 'http://goo.gl/H41gq7', '44.83386899', '-93.36943626'],
                    ['Kaposia Park', 'Together with Thompson Park creates a green corridor from the uplands down the bluff to the Mississippi.  Known for its disc golf course and wooded slopes leading to river flats along Concord St.', '651-306-3690 ', '1025 Wilde Ave, South St. Paul, MN, 55075', 'http://goo.gl/bguOrj', '44.90931873', '-93.0603452'],
                    ['Lebanon Hills Regional Park', 'A large park with rolling woodlands and two lakes. If arriving by transit, access the park trails via the campground at the western edge of the park. Take the trail that starts between campsites #85 & #87 to connect to the trail system.', '651-688-1376', '860 Cliff Road, Eagan, MN, 55123', 'http://goo.gl/bXEIRv', '44.77229393', '-93.16605882'],
                    ['Minneapolis Chain of Lakes', 'Paved walking and biking trails link Cedar Lake, Brownie Lake, Lake of the Isles, Lake Calhoun, and Lake Harriet. There are multiple access points via bus and bike paths. This area is very popular, and features views of the Minneapolis skyline. Boat rentals are available. In the summer, there is often live music at the bandstand. ', '612-230-6400', 'N/a', 'http://goo.gl/YoyjTh', '44.95080854', '-93.30913381'],
                    ['Minnehaha Park', 'One of the oldest and most popular parks in Minneapolis, it has many amenities and great views of the famed. The main walking trail leads along the creek to the Mississippi. Bike trails connect the park to Fort Snelling and Mississippi River bike trails.', '612-230-6400', '4801 S Minnehaha Park Dr, Minneapolis, MN, 55417', 'http://www.minneapolisparks.org/?PageID=4&parkid=252', '44.9152785', '-93.21007698'],
                    ['Springbrook Nature Center', 'This medium size green space features native prairies, oak and aspen forests, oak savannahs, and wetlands. Kid-friendly interpretive center.', '763-572-3588', '100 85th ave NW, Fridley, MN, 55432', 'http://goo.gl/goINr6', '45.12155959', '-93.27148714'],
                    ['Theodore Wirth Park', 'Large park with bike and hiking trails, golf courses, winter sports, lakes, ponds, historic chalet, and the Eloise Butler Wildflower Garden.', '612-370-4903', '1339 Theodore Wirth Pkwy, Minneapolis, MN, 55411', 'http://www.minneapolisparks.org/?PageID=4&parkid=255', '44.99145078', '-93.32617123'],
                    ['Thompson County Park', 'This Dakota County park has a large picnic area with a view of Thompson Lake. It has trails leading to the North Urban Regional Trail, which connects to nearby Kaposia Park and the Mississippi River Regional Trail. Dakota Lodge is a four-season event center within the park. Horseshoe pits, a playground, a fishing pier, and winter activities are other amenities.\r\n', 'N/A', '360 Butler Ave E, West St. Paul, MN, 55118', 'http://goo.gl/FOdlnD', '44.90801365', '-93.06842709'],
                    ['Wood Lake Nature Center', 'An urban park that has a wild feel despite proximity to I-35. Three miles of flat, wooded trails and boardwalk take you around and across lake and wetlands. Very good for birding walks. Great interpretive center.', '612-861-9365 ', '6710 Lakeshore Dr. Richfield, MN, 55423', 'http://goo.gl/lDxL6X', '44.87330418', '-93.29566872']
                ],
                parkEntrances = [
                    ['Elm Creek Park Reserve Entrance', 'http://goo.gl/DveKGN', 'Entrance identified as transit friendly, but bring your bike!  This entrance sits about 3 miles from the commuter train NSSC reccommends for accessing this park.', '45.18075934', '-93.41573883'],
                    ['Springbrook Nature Center Entrance', 'http://goo.gl/Nnryai', 'This entrance is about 0.6 miles from the bus stop NSSC identifies as a good option for accessing this park.', '45.12449237', '-93.27460761'],
                    ['Golden Valley Rd & Theodore Wirth Pkwy Entrance', 'http://goo.gl/j6wC5p', 'Take Bus 14 to reach this entrance.', '44.99928288', '-93.32272341'],
                    ['Wirth Chalet & Theodore Wirth Pkwy Entrance', 'http://goo.gl/g8xQ4h', 'Take Bus 7 to reach this entrance.', '44.99195747', '-93.32166499'],
                    ['Wayzata Blvd N & Theodore Wirth Pkwy Entrance', 'http://goo.gl/i8lgNS', 'Take Bus 9 to reach this entrance.', '44.97086952', '-93.32226364'],
                    ['Richfield Rd & Wm Berry Rd Entrance', 'http://goo.gl/ee0UMv', 'Take Bus 6 to reach this entrance.', '44.9339563', '-93.30942457'],
                    ['50th St W & Minnehaha Parkway Entrance', 'http://goo.gl/5eSXXv', 'Take buses 4 or 6 to reach this stop. This is the southernmost access to the Minneapolis Chain of Lakes, stopping just south of Lake Harriet.', '44.91287848', '-93.29798804'],
                    ['46th St & 44th Ave Entrance', 'http://goo.gl/1IBme1', 'Take Buses 46,74,84 to access this entrance.', '44.91827598', '-93.21035849'],
                    ['46th St & 46th Ave Entrance', 'http://goo.gl/ItUyWW', 'Take Bus 23 to access this entrance.', '44.9177217', '-93.21203487'],
                    ['46th St & Minneapolis Entrance', 'http://goo.gl/xqazgk', 'Take Buses 7 or 9 to access the park from this entrance.', '44.91690759', '-93.21421421'],
                    ['Hyland Lake Park Reserve Entrance', 'http://goo.gl/GJpsRg', 'Sits about 0.6 miles from the Normandale Blvd & Poplar Bridge Rd bus stop.', '44.83311265', '-93.36311821'],
                    ['MN Valley National Wildlife Refuge Entrance (Bass Ponds)', 'http://goo.gl/XJv3tr', 'Enter here for the best access to the Bass Ponds.  Take the MOA stop on the Hiawatha LRT or the 539 bus to 86th and Old Shakopee Rd.', '44.84870649', '-93.22874384'],
                    ['MN Valley National Wildlife Refuge Entrance (Visitor Center)', 'http://goo.gl/oxmd7T', 'Enter here for the best access to the Visitor Center.  Take the American Blvd stop on the Hiawatha LRT.', '44.86122776', '-93.2146195'],
                    ['Como Park Entrance', 'http://goo.gl/MA9Sjx', 'Best accessed via bus 3.', '44.97790397', '-93.14678783'],
                    ['Bruce Vento Nature Sanctuary Entrance', 'http://goo.gl/tmoQPi', 'None', '44.95255521', '-93.07390328'],
                    ['Crosby Farms Regional Park Entrance', 'http://goo.gl/zUZvRL', 'None', '44.89749832', '-93.16608086'],
                    ['Thompson County Park Entrance', 'http://goo.gl/7a4OSn', 'None', '44.91236178', '-93.07112191'],
                    ['Kaposia Park Entrance', 'http://goo.gl/fWExyl', 'None', '44.91381562', '-93.0543134'],
                    ['Fort Snelling State Park Entrance', 'http://goo.gl/l9RW3Q', 'None', '44.89244109', '-93.18290096'],
                    ['Lebanon Hills Regional Park Entrance', 'http://goo.gl/1ASLgW', 'Access via the Johnny Cake Ridge Rd stop.', '44.7730489', '-93.18736295']
                ],
                entranceMarkerArray = [],
                entranceIBs = [],
                infoMarkerArray = [],
                infoIBs = [],
                // End array defs


                setAllMap = function(array, map) {
                    for (var i = 0; i < array.length; i++) {
                        array[i].setMap(map);
                    }
                },

                directionsSetup = function() {
                    directionsService = new google.maps.DirectionsService();
                    directionsRenderer = new google.maps.DirectionsRenderer();
                    directionsRenderer.setPanel(document.querySelector("#dirList"));
                }, // directionsSetup Ends

                getDirections = function() {
                    if (userPos == undefined) {
                        alert('Make sure you have both a start end endpoint! Enter your location before clicking "Get Directions".')
                    } else {
                        // Swap panel content
                        $Selectors.dsInputs.hide();
                        $Selectors.dsResults.show();
                        var request = {
                            origin: userPos,
                            destination: parkDest,
                            provideRouteAlternatives: true,
                            travelMode: google.maps.DirectionsTravelMode.TRANSIT
                        };

                        directionsService.route(request, function(response, status) {
                            if (status == google.maps.DirectionsStatus.OK) {

                                directionsRenderer.setDirections(response);
                                directionsRenderer.setPanel(document.querySelector("#dirList"));
                                directionsRenderer.setMap(map);

                            } else if (status == google.maps.DirectionsStatus.NOT_FOUND) {

                                $Selectors.dirList.append('<div class="dirLeg">' +
                                    'Looks like Google Maps couldn&#39;t find that place. Sorry!' +
                                    '</div>' +
                                    '<br><br><div class="dirLeg">' +
                                    'If you entered your address manually, make sure it is properly' +
                                    'formatted:' +
                                    '</div>' +
                                    '<br><div class="dirLeg" style="text-align: center">' +
                                    '123 Example Rd., St. Paul, MN <br>' +
                                    'OR <br>' +
                                    'Example Rd & Some St, Minneapolis' +
                                    '</div>'
                                );

                            } else if (status == google.maps.DirectionsStatus.ZERO_RESULTS) {

                                $Selectors.dirList.append('<div class="dirLeg">' +
                                    'Oh no! Google Maps returned no usable routes. We apologize for the inconvenience!'
                                    + '</div>');

                            } else {

                                $Selectors.dirList.append('<div class="dirLeg">' +
                                    'Shoot, something went wrong. It could be a number of things, but try it again. ' +
                                    'If the problem persists, please email nronnei@gmail.com.' +
                                    + '</div>');
                                console.log(response);

                            }
                        });

                    }
                },

                infoSetup = function () {
                    var infoMarker = function(i) {
                        var siteLatLng = new google.maps.LatLng(park[5], park[6]);
                        var icon = {
                            anchor: new google.maps.Point(0, 0),
                            origin: new google.maps.Point(0, 0),
                            scaledSize: new google.maps.Size(20, 20),
                            size: new google.maps.Size(20, 20),
                            url: 'http://maps.google.com/mapfiles/kml/pal2/icon4.png'
                        };
                        var marker = new google.maps.Marker({
                            position: siteLatLng,
                            map: map,
                            title: park[0],
                            icon: icon,
                            index: i
                        });

                        // Begin example code to get custom infobox
                        var boxText = document.createElement("div");
                        boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: white; padding: 5px;";
                        boxText.innerHTML =
                            '<div class="parkInfo">' +
                            '<div class="parkHead">' +
                            '<h3 style="color: #3ABC9E" class="parkName">'+ park[0] + ' </h3>' +
                            '</div>' +
                            '<div class="parkContent">' +
                            '<p style="color:black"><b> Park Description</b><br>' + park[1] + '</p>' +
                            '<p style="color:black"><b> Address</b><br>' + park[3] + '</p>' +
                            '<p style="color:black"><b> Phone</b><br>' + park[2] + '</p>' +
                            '<p> <a href=' + park[4] + ' target="_blank" style:"color: blue!important">Visit Website</a></p>'+
                            '</div>' +
                            '</div>';

                        var myOptions = {
                            content: boxText
                            ,disableAutoPan: false
                            ,maxWidth: 0
                            ,pixelOffset: new google.maps.Size(-131, 16)
                            ,zIndex: null
                            ,boxStyle: {
                                background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/tags/infobox/1.1.12/examples/tipbox.gif') no-repeat"
                                ,opacity: 0.9
                                ,width: "320px"
                            }
                            ,closeBoxMargin: "10px 2px 2px 2px"
                            ,closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
                            ,infoBoxClearance: new google.maps.Size(50, 50)
                            ,isHidden: false
                            ,pane: "floatPane"
                            ,enableEventPropagation: false
                        };
                        // end example code for custom infobox

                        var infoBox = new InfoBox(myOptions);
                        infoIBs.push(infoBox);

                        google.maps.event.addListener(marker, "click", function () {
                            for (var x = 0; x < infoIBs.length; x++) {
                                infoIBs[x].close();
                            }
                            infoIBs[i].open(map, this);
                            map.setZoom(14);
                            map.panTo(marker.getPosition());
                        });
                        return marker;
                    };
                    for (var i = 0; i < parkInfo.length; i++) {
                        var park = parkInfo[i];
                        infoMarkerArray.push(infoMarker(i));
                    }
                },

                entranceSetup = function () {
                    var entranceMarker = function(i) {
                        var siteLatLng = new google.maps.LatLng(ent[3], ent[4]);
                        var icon = {
                            anchor: new google.maps.Point(0, 0),
                            origin: new google.maps.Point(0, 0),
                            scaledSize: new google.maps.Size(20, 20),
                            size: new google.maps.Size(20, 20),
                            url: 'http://www.clipartbest.com/cliparts/9cz/EGG/9czEGGdRi.png'
                        };
                        var marker = new google.maps.Marker({
                            position: siteLatLng,
                            map: null,
                            title: ent[0],
                            icon: icon,
                            index: i
                        });

                        // Begin example code to get custom infobox
                        var boxText = document.createElement("div");
                        boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: white; padding: 5px;";
                        boxText.innerHTML =
                            '<div class="parkEntrances">' +
                            '<div class="parkHead">' +
                            '<h3 style="color: #000000" class="parkName">'+ ent[0] + ' </h3>' +
                            '</div>' +
                            '<div class="parkContent">' +
                            '<p> <a href='+ent[1]+' target="_blank">Directions</a>' + '  </p>'+
                            '<p style="color:black"><b> Description</b><br>' + ent[2] + '</p>' +
                            '<div class="row">' +
                            '<div class="col-lg-12" style="padding-bottom: 5px; padding-top: 5px">' +
                            '<button id="gd-btn" class="btn btn-primary btn-block">Get Directions Here</button>' +
                            '</div>' +
                            '</div>' +
                            '</div>'+
                            '</div>';

                        var myOptions = {
                            content: boxText
                            ,disableAutoPan: false
                            ,maxWidth: 0
                            ,pixelOffset: new google.maps.Size(-131, 16)
                            ,zIndex: null
                            ,boxStyle: {
                                background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/tags/infobox/1.1.12/examples/tipbox.gif') no-repeat"
                                ,opacity: 0.9
                                ,width: "320px"
                            }
                            ,closeBoxMargin: "10px 2px 2px 2px"
                            ,closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
                            ,infoBoxClearance: new google.maps.Size(50, 50)
                            ,isHidden: false
                            ,pane: "floatPane"
                            ,enableEventPropagation: true
                        };
                        // end example code for custom infobox
                        var infoBox = new InfoBox(myOptions);
                        entranceIBs.push(infoBox);

                        google.maps.event.addListener(marker, "click", function () {
                            parkDest = marker.getPosition();
                            for (var x = 0; x < entranceIBs.length; x++) {
                                entranceIBs[x].close();
                            }
                            entranceIBs[i].open(map, this);
                            map.panTo(this.getPosition());
                        });
                        google.maps.event.addListener(entranceIBs[i], "domready", function () {
                            $('#gd-btn').on('click', function () {
                                $Selectors.dirList.empty();
                                setAllMap(entranceMarkerArray, null);
                                setAllMap(infoMarkerArray, null);
                                getDirections()
                            });
                        });
                        return marker;
                    };
                    for (var i = 0; i < parkEntrances.length; i++) {
                        var ent = parkEntrances[i];
                        entranceMarkerArray.push(entranceMarker(i));
                    }
                },

                mapSetup = function() {
                    map = new google.maps.Map($Selectors.mapCanvas, {
                        zoom: 10,
                        center: new google.maps.LatLng(44.95467069112005, -93.23650393164066),
                        mapTypeControl: false,
                        panControl: false,
                        streetViewControl: true,
                        streetViewControlOptions: {
                            position: google.maps.ControlPosition.RIGHT_BOTTOM
                        },
                        zoomControl: true,
                        zoomControlOptions: {
                            style: google.maps.ZoomControlStyle.DEFAULT,
                            position: google.maps.ControlPosition.RIGHT_BOTTOM
                        },
                        scaleControl: true,

                        overviewMapControl: false,

                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });

                    autoSrc = new google.maps.places.Autocomplete(document.getElementById("origin"));
                    autoSrc.bindTo('bounds', map);

                    //trafficSetup();
                    entranceSetup();
                    infoSetup();
                    directionsSetup();
                    geocodeSetup();
                }, // mapSetup Ends

                setUserLocation = function() {
                    if (userMarker == undefined) {
                        var icon = {
                            anchor: new google.maps.Point(0, 0),
                            origin: new google.maps.Point(0, 0),
                            scaledSize: new google.maps.Size(30, 30),
                            size: new google.maps.Size(30, 30),
                            url: 'http://maps.google.com/mapfiles/kml/paddle/ylw-stars.png'
                        };
                        userMarker = new google.maps.Marker({
                            icon: icon,
                            map: map,
                            title: "You are here!",
                            position: userPos

                        });
                    } else {
                        userMarker.setPosition(userPos);
                    }
                    map.setZoom(14);
                    map.setCenter(userPos);
                }, //setUserLocation Ends

                userGeolocation = function(p) {
                    var lat = p.coords.latitude;
                    var lng = p.coords.longitude;
                    $Selectors.origin.val(lat + ", " + lng);
                    userPos = new google.maps.LatLng(lat, lng);
                    setUserLocation();
                }, // userGeolocation Ends

                userGeocode = function () {
                    var input = document.querySelector("#origin").value;
                    var request = {
                        address: input,
                        bounds: map.getBounds()
                    };
                    geocoder.geocode(request, function (result, status) {
                        if (result == google.maps.GeocoderStatus.OK) {
                            userPos = status.geometry.location;
                            setUserLocation();
                            //console.log("userPos = " + userPos);
                            //console.log("Result = " + result);
                            console.log("Status = " + status);
                        }
                    });
                },

                invokeEvents = function() {
                    // Set visible extent for park entrances
                    google.maps.event.addListener(map, 'zoom_changed', function() {
                        var zoomLevel = map.getZoom();
                        if (zoomLevel >= 14) {
                            setAllMap(entranceMarkerArray, map);
                        } else {
                            setAllMap(entranceMarkerArray,null)    }
                    });

                    //Keydown listener for entering user location
                    $Selectors.origin.keypress(function() {
                        if(event.which == 13)
                        {
                            userGeocode();
                        }
                    });


                    // Set click behavior

                    // Submit User Location
                    $Selectors.newLocation.on('click', function() {
                        userGeocode();
                    });


                    // Reset Btn
                    $Selectors.resetBtn.on('click', function(e) {
                        $Selectors.dirList.empty();
                        $Selectors.dsResults.hide();
                        $Selectors.dsInputs.show();
                        setAllMap(infoMarkerArray, map);
                        directionsRenderer.setMap(null);
                    });

                    // Use My Location / Geo Location Btn
                    $Selectors.gpsBtn.click(function() {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(function(position) {
                                userGeolocation(position);
                            });
                        }
                    });
                }, //invokeEvents Ends

                _init = function() {
                    mapSetup();
                    invokeEvents();
                }; // _init Ends

            this.init = function() {
                _init();
                return this; // Refers to: mapDemo.Directions
            };
            return this.init(); // Refers to: mapDemo.Directions.init()
        } // _Directions Ends
        return new _Directions(); // Creating a new object of _Directions rather than a funtion
    }()); // mapDemo.Directions Ends
})(window.mapDemo = window.mapDemo || {}, jQuery);