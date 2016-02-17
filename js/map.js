/* Embedd the map in the webpage */

L.mapbox.projectId = 'rharish.p2i83c48';
L.mapbox.accessToken = 'pk.eyJ1IjoicmhhcmlzaCIsImEiOiJjaWs4OWl4bGQwMWcydHhrd3ZmczdzN2lsIn0.mCz4ybX25lp0z7-rXXxqiQ';

var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/' + L.mapbox.projectId + '/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
});
var map = L.map('map').addLayer(mapboxTiles).setView([42.3610, -71.0587], 15);
