app.controller('FrontPageCtrl', function ($scope, $window, $location) {
    var s = $scope;
    var l = $location;

    s.click = function() {
        $('html,body').animate({scrollTop:$window.innerHeight}, 350);
    };
});