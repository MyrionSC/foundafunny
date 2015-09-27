app.directive('resize', function ($window) {
    return function($scope) {
        //$scope.initializeWindowSize = function() {
        //    var h = $window.innerHeight - 25;
        //    var w = $window.innerWidth - 25;
        //
        //    console.log("h: " + h + ", w: " + w);
        //    $scope.calcAndApplyDimensions(h, w);
        //};
        //$scope.initializeWindowSize();
        //return angular.element($window).bind('resize', function() {
        //    if ($scope.resizeReady) {
        //        $scope.initializeWindowSize();
        //        return $scope.$apply();
        //    }
        //});
    };
});