app.controller('SettingsCtrl', function($scope, $location, sidebarService, contentService) {
    var s = $scope;
    var cs = contentService;
    var optionobj = sidebarService.csInfoObj;

    s.ShowTimerSavedFeedback = false;
    s.ShowNoChangesFeedback = false;

    optionobj.SetSelected();

    // broadcast receivers
    s.$on('update-settings', function () {
        SettingsInit();
    });

    var SettingsInit = function () {
        // Init selectboxes. May god forgive my soul for doing DOM manipulation from here
        $('#themeselect').val(cs.Page.Settings.theme);
        $('#timezoneselect').val(cs.Page.Settings.timezoneVal);
    };

    // init
    SettingsInit();
});