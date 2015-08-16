app.directive('imageload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                var initHeight = element[0].clientHeight;
                var initWidth = element[0].clientWidth;
                scope.calcAndApplyDimensions(initHeight, initWidth);
            });
        }
    };
});