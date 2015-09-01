var app = angular.module('SDMMainPage', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/frontpage', { templateUrl: 'mainpage/Views/FrontpageView.html', controller: 'FrontPageCtrl'})
        .when('/createpage', { templateUrl: 'mainpage/Views/CreatepageView.html', controller: 'CreatePageCtrl'})
        .otherwise({ redirectTo: '/frontpage' });

    //$locationProvider.html5Mode(true);
});