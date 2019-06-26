//Defines the knockout ViewModel.
var ViewModel = function() {
  //Declare knockout observables.
  var self = this;
  self.locations = ko.observableArray([]);
  self.currentFocus = ko.observable('Hamilton,ON');
  self.searchLimit = ko.observable(10);
  self.markers = ko.observableArray([]);
  self.selectedMarker = ko.observable(null);
  self.infoWindow = ko.observable(null);
  self.map;

  //This function toggles items as either displayed or not displayed on the map
  //while also highlighting or unhighlighting items on the list.
  self.showLocation = function(location) {
  //Using the provided location determine the matching marker on the map.
  var marker = self.getMarkerForLocation(location);
  //Find the index of the provided location in the locations index array.
  var locationIndex = self.locations().indexOf(location);
  //Get the list item from the DOM for the provided location.
  var listItem = document.getElementById('loc-'+locationIndex);
  //If the marker is not showing on the map make it showing on the map, and
  //change the background color to grey and the font color to white. If the
  //marker for the location is showing on the map, hide it, remove it from
  //the markers array and change the list item DOM element background color
  //to white and the font color to black.
  if(marker.getMap() == null){
      marker.setMap(self.map);
      listItem.style.color = 'white';
      listItem.style.backgroundColor = 'grey';
    } else {
      marker.setMap(null);
      self.markers.remove(marker);
      listItem.style.color = 'black';
      listItem.style.backgroundColor = 'white';
    }
  }

  //The function uses a provided location to find the associated marker.
  self.getMarkerForLocation = function(location) {
    //Marker and match count variables are defined so that when a marker is
    //found the number of matches can be provided for troubleshooting.
    var marker;
    var matchCount = 0;

    //In order to be able to compare using the equals() function of the
    //google.maps.LatLng class, the location provided needs to be converted
    //to a google.maps.LatLng.
    var locationLatLng = new google.maps.LatLng({
      lat: location.location.lat,
      lng: location.location.lng
    });

    //This for loop goes through the markers array and compares the titles, and
    //coordinates of the provided location against each marker. If the marker
    //matches then it is passed to the marker variable, and the matchCount is
    //increased by 1.
    for (var i = 0; i < self.markers().length; i++){
      if(self.markers()[i].getTitle() == location.title &&
       locationLatLng.equals(self.markers()[i].getPosition())){
        marker = self.markers()[i];
        matchCount++;
      }
    }

    //If the match count is greater than 1 it returns the marker variable, if
    //no marker is found then it passes the provided location into the
    //makeMarkers function to create a marker for the location and then restarts
    //this function to find the marker for provided location. This will return
    //only the match with the highest index number.
    if(matchCount > 0){
      return marker;
    } else {
      var markerLocations = [location];
      self.makeMarkers(markerLocations);
      return self.getMarkerForLocation(location);
    }
  }

  //This function uses uses the provided marker to search the locations array
  //for a match and returns a locaation.
  self.getLocationForMarker = function(marker) {
    //The location and matchCount variables are assigned for tracking matches
    //for troubleshooting.
    var location;
    var matchCount = 0;

    //This for loop iterates through the locations array, comparing the
    //title and latlng for each marker to the title and coordinates for the
    //location.
    for (var i = 0; i < self.locations().length; i++){
      //In order to be able to compare the location coordinates to the
      //position of the marker using the equals() function they must be
      //converted to a google.maps.LatLng.
      var locationLatLng = new google.maps.LatLng({
        lat: self.locations()[i].location.lat,
        lng: self.locations()[i].location.lng
      });

      //If location and marker match, pass the matching location to the locations
      //variable, ans increase the matchCount by one.
      if(self.locations()[i].title == marker.getTitle() &&
       locationLatLng.equals(marker.getPosition())){
        location = self.locations()[i];
        matchCount++;
      }
    }

    //If matchCount is greater than 0 return the matching location. This would
    //return only the highest index match.
    if(matchCount > 0){
      return location;
    } else {
      console.log("No Location Found");
    }
  }

  //This function checks for a matching function to a provided location.
  //If a match is found it returns true, if no match is found it returns false.
  self.checkMarkersForLocation = function(location) {
    var matchCount = 0;
    var locationLatLng = new google.maps.LatLng({
      lat: location.location.lat,
      lng: location.location.lng
    });
    for (var i = 0; i < self.markers().length; i++){
      var marker = self.markers()[i];
      if(marker.getTitle() == location.title  &&
       locationLatLng.equals(self.markers()[i].getPosition())){
        matchCount++;
        return true;
      }
    }
    if(matchCount = 0){
      return false;
    }
  }

  //This function is called when a user presses the search button. It sets then
  //current focus of the application to the value provided in the search box,
  //turns off all markers, queries the foursquare API for new locations, and
  //zooms to the location on the map.
  self.setCurrentFocus = function() {
    //Sets the current focus using the information provided in the location
    //text input box. The string has spaces removed in order to placed in to
    //the query url in an appropriate format.
    self.currentFocus(document.getElementById('location').value.replace(" ", ""));
    //Hides and removes all markers and unhighlights the associated list item.
    self.toggleAllMarkers();
    //Queries the foursquare API and updates the locations array with the
    //results.
    self.updateLocations();
    //Zooms to the new location provided.
    self.zoomToArea(self.currentFocus());
  }

  //This function queries the foursquare API to populate the locations array
  //with the venues obtained.
  self.updateLocations = function(){
    //Define a new emptry string to pass the query parameters into.
    var queryParam = "";
    //Set the location to be searched to the current focus fo the application.
    var locationSearch = self.currentFocus();
    //Define a new XMLHttpRequest object.
    var xhttp = new XMLHttpRequest();

    //Assign the value of the search input box to a variable.
    var searchInputValue = document.getElementById('search-params').value;
    //If there is a a value entered into the text box, take it and construct
    //the string to pass into the url.
    if(searchInputValue){
      queryParam = 'query=' + searchInputValue + '&';
    } else {
      //Define a default query paramater.
      queryParam = 'query=Restaurant&';
    }

    //When the xhttp state changes, check if the request is good. If it is,
    //parse through the json object storing the results. For each of the venues
    //returned in the response create an array item and push it into the
    //locations array.
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var venues = JSON.parse(this.response).response.venues;
        self.locations([]);
        for(i = 0; i < venues.length; i++) {
          self.locations.push({
            title: venues[i].name, location: {lat: venues[i].location.lat,
               lng: venues[i].location.lng}
          });
          //For each location created show the marker, and highlight the
          //location in the list.
          self.showLocation(self.locations()[i]);
        }
      }
    };

    //Assemble the url using the search limit, queary parameters, and location.
    var fourSquareURL ='https://api.foursquare.com/v2/venues/search?'+
     queryParam +'limit='+self.searchLimit()+'&near='+
     locationSearch+
     '&client_id=DGB0B4YMP1PAQPMCB5OEAB51B14PABII45T12QY5EGWEI0HN&'+
     'client_secret=TQ5RY024HNUEOQVVPV1GAQDKRQGUJSMBEZBIKATIYJ4TPVFO&v=20180608';

    //Create and send the get request.
    xhttp.open("GET", fourSquareURL, true);
    xhttp.send();
  }

  //This function updates the map, create the visual style of the map, and
  //creating the global infoWindow for the map.
  self.updateMap = async function(){
    //Define the styles for the array. The styles used were provided in the
    //Udacity Nanodegree Full-Stack Developer course material.
    var styles = [
      {
        featureType: 'water',
        stylers: [
          { color: '#19a0d8'}
        ]
      },{
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [
          { color: '#ffffff'},
          { weight: 6 }
        ]
      },{
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#e85113' }
        ]
      },{
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
          { color: '#efe0e4'},
          { lightness: -40 }
        ]
      },{
        featureType: 'transit.station',
        stylers: [
          { weight: 9 },
          { hue: '#e85113'}
        ]
      },{
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [
          { visibility: 'off' }
        ]
      }
    ]

  //If there is no map assigned to the global map variable, create a new google
  //map using the provided styles.
  if(!self.map){
    self.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 43.250021, lng: -79.866091},
      zoom: 13,
      styles: styles,
      mapTypeControl: false
    });
  }

  //Create the global infowindow.
  self.infoWindow(new google.maps.InfoWindow());
}

  //This function zooms to the provided point on the google map.
  self.zoomToArea = function(point) {
    //Check if the point is a string. If it is geocode the result and zoom
    //to it. If it is not a string zoom to the provided location.
    if(typeof point == "string"){
      var geocoder = new google.maps.Geocoder();
      var bounds = self.map.getBounds();

      var address = self.currentFocus();
      if (address == '') {
        window.alert('You must enter an area, or adress.')
      } else {
        geocoder.geocode({
        address: address,
        bounds: bounds
        }, function(results, status){
          //Check to see if geocode request was successful.
          if (status == google.maps.GeocoderStatus.OK){
            self.map.setCenter(results[0].geometry.location)
            self.map.setZoom(12);
          } else {
            //If geocode is unsucessful, inform the user that they need to be
            //more specific or use better formatting.
            window.alert(`We could not find that location
            try entering a more specfiic location, or use better formatting.
             (ie. City, State/Province, Country)`);
          }
        });
      }
    } else {
      self.map.setCenter(point.location);
    }
  }

  //This function creates markers for the locations provided and pushes them
  //into the markers array.
  self.makeMarkers = function(locations) {
    //Define the default and highlighted marker icons.
    var defaultIcon = self.makeMarkerIcon('0091ff');
    var highlightedIcon = self.makeMarkerIcon('FFFF24');

    //If ther are locations for each location in the locations array create
    //marker.
    if (locations.length !== 0) {
        for (var i = 0; i < locations.length; i++) {


          //If there is not a marker for the location, push the marker to the
          //markers array.
          if(!self.checkMarkersForLocation(locations[i])){
            var position = locations[i].location;
            var title = locations[i].title;

            var marker = new google.maps.Marker({
              map: null,
              position: position,
              title: title,
              icon: defaultIcon,
              animation: google.maps.Animation.DROP,
              id: i
            });

            //Push marker to markers array.
            self.markers().push(marker);

            //Create an listener to call a function when the marker is clicked.
            marker.addListener('click', function() {
              //On click if the marker is not the currently selected marker,
              //and there is no animation for the marker.
              if (marker != self.selectedMarker && marker.getAnimation() == null) {
                //If there is a currently selected marker.
                if(self.selectedMarker()) {
                  //Stop the animation for the currently selected marker.
                  self.selectedMarker().setAnimation(null);
                }
                //Set the animation to the bounce animation.
                marker.setAnimation(google.maps.Animation.BOUNCE);
                //Assigns the marker as the selected marker.
                self.selectedMarker(marker);
                //Populate the infowindow with the marker information.
                self.populateInfoWindow(this, self.infoWindow());
              } else {
                //Turn the animation off and clear the selectedMarker.
                marker.setAnimation(null);
                self.selectedMarker(null);
              }
            });

            //Add listener that sets the marker icon the the highlighted icon
            //when the mouse is held over the marker.
            marker.addListener('mouseover', function() {
              this.setIcon(highlightedIcon)
            });

            //Add listener that sets the marker icon to the default icon when
            //the mouse is no longer held over the marker.
            marker.addListener('mouseout', function() {
              this.setIcon(defaultIcon);
            });
          }
        }
      } else {
        //Inform the user that no locations were found.
        console.log('No locations found');
        window.alert('No locations found');
      }
  }

  //This function turns off all markers if there are any, or turns on all
  //markers if there aren't any on.
  self.toggleAllMarkers = async function() {
    //Creates an empty marker array to track active markers.
    let activeMarkersPromise = new Promise(function(resolve, reject) {
        
	let markersArray = [];
        for(i = 0; i < self.markers().length; i++){
                if(self.markers()[i].getMap()){
                        markersArray.push(self.markers()[i]);
                }
        }  
	resolve(markersArray);
    });

    let activeMarkers = await activeMarkersPromise;
    //If there are any markers in the activeMarkers array turn turn off
    //only the markers that are active. If there are no markers active,
    //make all makers active for all locations.
    if(activeMarkers.length > 0){
      for (i = 0; i < activeMarkers.length; i++) {
        self.showLocation(self.getLocationForMarker(activeMarkers[i]));
      }
    } else {
      for (i = 0; i < self.locations().length; i++) {
        self.showLocation(self.locations()[i]);
      }
    }
  }

  //This function takes the provided marker to populate the provided infoWindow.
  self.populateInfoWindow = function(marker, infowindow){
    //If the infowindow marker is not the marker provided.
    if (infowindow.marker != marker) {
      //Empty the infowindow content.
      infowindow.setContent('');
      //Assign the provided marker tot he infoWindow.
      infowindow.marker = marker;
      //Add a listner to clear the infowindow marker when the window is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });

      //Create a new street view service.
      var streetViewService = new google.maps.StreetViewService();
      //Define a radius for the street view sphere.
      var radius = 50;
      //Get the streetview information.
      function getStreetView(data, status) {
        //If the request is okay and returns a response.
        if (status == google.maps.StreetViewStatus.OK) {
          //Assign the near location to the location of the data provided.
          var nearStreetViewLocation = data.location.latLng;
          //Create the street view heading.
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');

            //Define street view options.
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 30
              }
            };
          //Create a street view panel on the DOM using te options defined.
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          //Inform the user that no streetview could be found.
          infowindow.setContent('<div>' + marker.title + '</div>' +
            '<div>No Street View Found</div>');
        }
      }
      //Get the streeet view.
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      //Open the street view on the marker on the global map.
      infowindow.open(self.map, marker);
    }
  }

  //The marker takes the provided color and creates a marker image using the
  //API.
  self.makeMarkerIcon = function(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));

    return markerImage;
  }

  //This function opens and closes the left side menu when viewing the app on
  //smaller screens.
  self.showMenu = function() {
    var menu = document.getElementById('menu');
    var mapContainer = document.getElementById('map');
    var menuButton = document.getElementById('menu-button');
    var buttonContainer = document.getElementById('button-container');
    if(menu.style.visibility == "visible"){
        menu.style.visibility = "hidden";
        mapContainer.style.left = '0';
        menuButton.style.transform = 'scaleX(1)';
        buttonContainer.style.left = '0';
    } else {
      menu.style.visibility = "visible"
      mapContainer.style.left = '75%';
      menuButton.style.transform = 'scaleX(-1)';
      buttonContainer.style.left = '75%';
    }
  }
}

//Called as a callback function from the request to the Google Maps API.
// This function initializes the map, by first making a call to update the
//locations with data from the foursquare API, and then updating the map
//using the google maps API.
function initMap() {
  vm.updateLocations();
  vm.updateMap();
}

//Defines Breakpoints.
$(window).on('resize', function () {
    if ($(window).height() < 400) {
        $('#map').addClass('col-3');
        $('#map').removeClass('col-9');

        $('#menu').addClass('col-9');
        $('#menu').removeClass('col-3');
    }
    else if
})

//Crete a new ViewModel and apply Knockout bindings to it.
var vm = new ViewModel();
ko.applyBindings(vm);
