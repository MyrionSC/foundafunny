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
            s.ShowNoChangesFeedback = true;
            setTimeout(function () {
                s.ShowNoChangesFeedback = false;
                s.$apply();
            }, 3000);
            return;
        }

        s.ShowSettingsSavedFeedback = true;
        setTimeout(function () {
            s.ShowSettingsSavedFeedback = false;
            s.$apply();
        }, 3000);

        // extract new settings
        cs.Page.Settings.theme = s.theme;
        var jele = $('#timezoneselect');
        cs.Page.Settings.timezoneVal = s.timezoneVal;
        cs.Page.Settings.timezoneReadable = $('#timezoneselect option[value="' + s.timezoneVal + '"]').html();
        // transform the offset into minutes
        var offset = $('option:selected', jele).attr('data-offset');
        var hours = parseInt(offset.substring(0,3));
        var min = parseInt(offset.substring(4, 6));
        if (hours < 0) min *= -1;
        cs.Page.Settings.offset = hours * 60 + min;

        // update settings locally
        cs.UpdateFrontPageStyle();

        // push new settings to server
        cs.SaveSettings(cs.Page.Settings);
    };

    // broadcast receivers
    s.$on('update-settings', function () {
        SettingsInit();
    });

    var SettingsInit = function () {
        s.theme = cs.Page.Settings.theme;
        s.timezoneVal = cs.Page.Settings.timezoneVal;
    };


    // init
    SettingsInit();
});