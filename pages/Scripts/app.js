var app = angular.module('FaFApp', ['ngRoute', 'ngAnimate','checklist-model', 'timer', 'ngDialog']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/frontpage', { templateUrl: 'pages/View/FrontPageView.html', controller: 'FrontPageCtrl'})
        .when('/favorite', { templateUrl: 'pages/View/FavoriteView.html', controller: 'FavoriteCtrl'})
        .when('/history', { templateUrl: 'pages/View/HistoryView.html', controller: 'HistoryCtrl'})
        .when('/timers', { templateUrl: 'pages/View/TimersView.html', controller: 'TimersCtrl'})
        .when('/settimer', { templateUrl: 'pages/View/SetTimerView.html', controller: 'SetTimerCtrl'})
        .when('/settings', { templateUrl: 'pages/View/SettingsView.html', controller: 'SettingsCtrl'})
        .otherwise({ redirectTo: '/frontpage' });
});
