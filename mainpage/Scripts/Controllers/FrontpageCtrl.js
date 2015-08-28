app.controller('FrontPageCtrl', function ($scope, $location) {
    var s = $scope;
    var l = $location;

    s.test = "frontpage, this is a";
    s.click = function() {
        l.path('createpage');
    };
});