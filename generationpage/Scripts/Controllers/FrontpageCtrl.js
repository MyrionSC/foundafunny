app.controller('FrontPageCtrl', function ($scope, $window, $location) {
    var s = $scope;
    var l = $location;

    s.click = function() {
        $('html,body').animate({scrollTop:10000}, 1500); // scroll all the fucking way down
    };
});