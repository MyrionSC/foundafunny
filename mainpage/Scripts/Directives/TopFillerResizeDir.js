app.directive('topfillerresize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.$watch(function () {
            return { 'h': $window.innerHeight };
        }, function (newValue, oldValue) {
            scope.topFillerHeight = newValue.h / 5 + "px";
        }, true);
        w.bind('resize', function () {
            scope.$apply();
        });
    }
});