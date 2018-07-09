# My Neighborhood Map Project - Udacity Full Stack Web Developer Nanodegree

A JavaScript web application that allows users to search for venues by location.
Users can type in a filter to view venues of certain type, as well as type in
locations to limit their searches to certain geographic locations. The
Foursquare Places API is used to populate a list of locations meeting the
criteria specified by the user. The script I wrote then uses the Google Maps
API to create markers, info windows, and maps with the information obtained from
the Foursquare requests.

Users can click list items on the side menu to toggle on and off markers on the
map. They can also select markers on the map to make the markers bounce and view
the info window displaying Google Street View information. Users can search for
venues of certain types and locations by passing parameters into the input
boxes. They can also chose to limit their searches using the drop down menu
next to the search button.

Most of the code is my code, with some of the Google Maps related code being
adapted from material completed during the Front End Section of the
Udacity Full Stack Web Developer Nanodegree.

## Requirements

* Python 2.7.12 or higher
* An active internet connection

## How to run the app

Using a python SimpleHTTPServer (python2) or http.server (python3) start a
virtual machine in the directory with the index.html file.

In the address bar of any web browser enter:
``http://localhost:`<The port you started your server on>``

If using SimpleHTTPServer or http.server, the default port will be `8000`.

Authored by: Adam Gallant, 2018-06-15
