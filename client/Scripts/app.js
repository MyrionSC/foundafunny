var app = angular.module('SDMApp', ['ngRoute', 'ngAnimate','checklist-model', 'timer', 'ngDialog']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/frontpage', { templateUrl: 'View/FrontPageView.html', controller: 'FrontPageCtrl'})
        .when('/favorite', { templateUrl: 'View/FavoriteView.html', controller: 'FavoriteCtrl'})
        .when('/history', { templateUrl: 'View/HistoryView.html', controller: 'HistoryCtrl'})
        .when('/timers', { templateUrl: 'View/TimersView.html', controller: 'TimersCtrl'})
        .when('/settimer', { templateUrl: 'View/SetTimerView.html', controller: 'SetTimerCtrl'})
        .when('/configuresite', { templateUrl: 'View/ConfigureSiteView.html', controller: 'ConfigureSiteCtrl'})
        .otherwise({ redirectTo: '/frontpage' });
});
