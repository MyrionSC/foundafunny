var app = angular.module('SDMMainPage', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/frontpage', { templateUrl: 'mainpage/Views/FrontpageView.html', controller: 'FrontPageCtrl'})
        .when('/createpage', { templateUrl: 'mainpage/Views/CreatepageView.html', controller: 'CreatePageCtrl'})
        .otherwise({ redirectTo: '/frontpage' });
});