 
   // Initialize Firebase
   var config = {
   
  };
  firebase.initializeApp(config);

var app = angular.module('myApp', ['ngMaterial', 'ngRoute', 'ngAnimate', 'firebase']);

/**Route Configuration**/
app.config(function($routeProvider) {
  $routeProvider
// Home
  .when("/", {templateUrl: "partials/main.html", controller: "AppCtrl"})
// Pages
  .when("/settings", {templateUrl: "partials/settings.html", controller: "AppCtrl"})
  .when("/login", {templateUrl: "partials/login.html", controller: "AppCtrl"})
  .when("/pending", {templateUrl: "partials/pending.html", controller: "AppCtrl"})
  .when("/about", {templateUrl: "partials/about.html", controller: "AppCtrl"})
  .when("/signin", {templateUrl: "partials/sign-in.html", controller: "AppCtrl"})
/* etc… routes to other pages… */
.otherwise( {templateUrl: "partials/main.html", controller: "AppCtrl"});

// else 404

});
app.config(function($mdThemingProvider) {

  $mdThemingProvider.theme('default')
    .primaryPalette('grey', {
      'default': '800', // by default use shade 400 from the pink palette for primary intentions
      'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
      'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
    })
    // If you specify less than all of the keys, it will inherit from the
    // default shades
    .accentPalette('amber', {
      'default': '500' // use shade 200 for default, and keep all other shades the same
    }); });




