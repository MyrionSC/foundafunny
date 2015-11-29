app.controller('MainCtrl', function ($scope, $window) {
    var s = $scope;

    s.bgHeight = $window.innerHeight + "px";
    s.bgWidth = $window.innerWidth + "px";
    s.topFillerHeight = $window.innerHeight / 5 + "px";
});