app.directive('windowresize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.$watch(function () {
            return { 'h': $window.innerHeight, 'w': $window.innerWidth };
        }, function (newValue, oldValue) {
            scope.bgHeight = newValue.h + "px";
            scope.bgWidth = newValue.w + "px";
        }, true);
        w.bind('resize', function () {
            scope.$apply();
        });
    }
});