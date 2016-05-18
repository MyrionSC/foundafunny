app.controller('DocumentationCtrl', function($scope, $document) {
    var s = $scope;

    var h = $document[0].body.clientHeight - 150;
    s.height = h + "px";
});