app.directive('videoload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('loadeddata', function() {
                var initHeight = element[0].clientHeight;
                var initWidth = element[0].clientWidth;
                scope.calcAndApplyDimensions(initHeight, initWidth);
            });
        }
    };
});