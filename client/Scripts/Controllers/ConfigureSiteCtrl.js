app.controller('ConfigureSiteCtrl', function($scope, $location, sidebarService, contentService, navigationService) {
    var s = $scope;
    var optionobj = sidebarService.csInfoObj;

    optionobj.SetSelected();
});
