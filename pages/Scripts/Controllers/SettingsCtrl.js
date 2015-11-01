app.controller('SettingsCtrl', function($scope, $location, sidebarService, contentService) {
    var s = $scope;
    var cs = contentService;
    var optionobj = sidebarService.csInfoObj;

    s.theme = "";
    s.timezoneVal = "";

    s.ShowSettingsSavedFeedback = false;
    s.ShowNoChangesFeedback = false;

    optionobj.SetSelected();

    s.SaveSettings = function() {
        // check to see if anything was changed, show appropriate feedback
        if (s.theme === cs.Page.Settings.theme &&
            s.timezoneVal === cs.Page.Settings.timezoneVal) {
            console.log("sldkjf");
            s.ShowNoChangesFeedback = true;
            setTimeout(function () {
                s.ShowNoChangesFeedback = false;
                s.$apply();
            }, 3000);
            return;
        }

        console.log("hoooooooooo");

        s.ShowSettingsSavedFeedback = true;
        setTimeout(function () {
            s.ShowSettingsSavedFeedback = false;
            s.$apply();
        }, 3000);

        // update settings locally
        cs.Page.Settings.theme = s.theme;
        cs.UpdateFrontPageStyle();
        // timezone logic here

        // push new settings to server
        cs.SaveSettings(cs.Page.Settings);
    };

    // broadcast receivers
    s.$on('update-settings', function () {
        SettingsInit();
    });

    var SettingsInit = function () {
        // Init selectboxes. May god forgive my soul for doing DOM manipulation from here
        $('#themeselect').val(cs.Page.Settings.theme);
        $('#timezoneselect').val(cs.Page.Settings.timezoneVal);

        s.theme = cs.Page.Settings.theme;
        s.timezoneVal = cs.Page.Settings.timezoneVal;
    };


    // init
    SettingsInit();
});