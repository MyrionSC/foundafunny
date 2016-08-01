app.controller('SetTimerCtrl', function($scope, TimerObj, sidebarService, contentService, dialogService) {
    var s = $scope;
    var optionobj = sidebarService.stInfoObj;

    // binding variables
    s.Timer = new TimerObj();
    s.StartContent = "";
    s.EndContent = "";

    s.StartContentAddIcon = "pages/Pics/AdditionGreen.png";
    s.EndContentAddIcon = "pages/Pics/AdditionGreen.png";
    s.StartContentDisabled = false;
    s.EndContentDisabled = false;
    s.DialogCaller = "";

    s.ShowWeeklyTypes = false;
    s.ShowStartContentError = false;
    s.ShowAtleastOneWeekDayError = false;
    s.ShowActivationTimeError = false;
    s.ShowActivationLengthWithoutEndContentError = false;
    s.ShowActivationLengthNaNError = false;
    s.ShowEndContentWithoutActivationLengthError = false;
    s.ShowTimerSavedFeedback = false;

    s.setShowWeeklyTypes = function (val) {
        s.ShowAtleastOneWeekDayError = false;
        s.ShowWeeklyTypes = val;
    };

    // datetime pickers
    var datepicker = $('#datetimepicker_date');
    var hourpicker = $('#datetimepicker_hour');
    datepicker.datetimepicker({
        format: 'dd/MM/yyyy hh:mm:ss',
        language: 'en'
    });
    hourpicker.datetimepicker({
        pickDate: false,
        format: 'hh:mm:ss',
        language: 'en'
    });

    // save timer to db
    s.SaveTimer = function () {
        // reset errors
        var Errors = false;
        resetErrors();

        // extract chosen time
        var at = s.Timer.Type === "OneTime" ? datepicker.data('datetimepicker').getDate()
            : hourpicker.data('datetimepicker').getDate();

        // determine if any errors with input
        if (s.StartContent.length === 0) {
            s.ShowStartContentError = true;
            Errors = true;
        }
        if (s.Timer.Type === "Weekly" && !anyActivationsDaysSelected(s.Timer.ActivationDays)) {
            s.ShowAtleastOneWeekDayError = true;
            Errors = true;
        }
        if (s.Timer.Type === "OneTime" && !ActivationTimeMoreThanCurrentTime(contentService.Page.Settings.offset, at)) {
            s.ShowActivationTimeError = true;
            Errors = true;
        }
        if (s.EndContent.length != 0 && (s.Timer.ActivationLength === null || s.Timer.ActivationLength === 0)) {
            s.ShowActivationLengthWithoutEndContentError = true;
            Errors = true;
        }
        if (!isInt(s.Timer.ActivationLength)) {
            s.ShowActivationLengthNaNError = true;
            Errors = true;
        }
        if (s.Timer.ActivationLength != 0 && s.EndContent.length === 0) {
            s.ShowEndContentWithoutActivationLengthError = true;
            Errors = true;
        }

        // if no errors, send input to server
        if (!Errors) {
            s.Timer.calculateValues(s.StartContent, s.EndContent, at,
                contentService.Page);

            // show feedback
            s.ShowTimerSavedFeedback = true;
            setTimeout(function () {
                s.ShowTimerSavedFeedback = false;
            }, 3000);

            // send timer to server
            contentService.PushNewTimerToServer(s.Timer);

            // reset values
            s.Timer = new TimerObj();
            setDatePickerToPageTime();
            resetValues();
        }
    };

    // -------------------|
    // ADD DIALOG METHODS |
    // -------------------|

    s.AddAdditionalStartContent = function(timer) {
        var AddDialogInput = timer.StartContent.length === 0 ? s.StartContent : "";
        dialogService.ModifyContentDialog(s, "start", AddDialogInput, timer.StartContent.slice(),
            function (contentArray) {
                timer.StartContent = contentArray.slice();
                if (contentArray.length > 0) {
                    s.StartContentDisabled = true;
                    s.StartContent = contentArray.length + " content in list";
                } else {
                    s.StartContentDisabled = false;
                    s.StartContent = "";
                }
            }
        );
    };
    s.StartContentMouseEnter = function() {
        s.StartContentAddIcon = "pages/Pics/AdditionDarkGreen.png";
    };
    s.StartContentMouseLeave = function() {
        s.StartContentAddIcon = "pages/Pics/AdditionGreen.png";
    };

    s.AddAdditionalEndContent = function(timer) {
        var AddDialogInput = timer.EndContent.length === 0 ? s.EndContent : "";
        dialogService.ModifyContentDialog(s, "end", AddDialogInput, timer.EndContent.slice(),
            function (contentArray) {
                timer.EndContent = contentArray.slice();

                if (contentArray.length > 0) {
                    s.EndContentDisabled = true;
                    s.EndContent = contentArray.length + " content in list";
                } else {
                    s.EndContentDisabled = false;
                    s.EndContent = "";
                }
            }
        );
    };
    s.EndContentMouseEnter = function() {
        s.EndContentAddIcon = "pages/Pics/AdditionDarkGreen.png";
    };
    s.EndContentMouseLeave = function() {
        s.EndContentAddIcon = "pages/Pics/AdditionGreen.png";
    };


    // broadcast receivers
    s.$on('update-set-timer', function () {
        setDatePickerToPageTime();
    });

    // local functions
    var setDatePickerToPageTime = function() {
        var utc = Date.now();
        var ClientDate = new Date(utc + contentService.Page.Settings.offset * 60000);

        datepicker.data('datetimepicker').setDate(ClientDate);
        hourpicker.data('datetimepicker').setDate(ClientDate);
    };
    var resetValues = function () {
        s.StartContent = "";
        s.EndContent = "";
        s.ShowWeeklyTypes = false;
        s.StartContentDisabled = false;
        s.EndContentDisabled = false;
        s.ShowStartContentError = false;
        s.ShowAtleastOneWeekDayError = false;
        s.ShowActivationTimeError = false;
        s.ShowActivationLengthWithoutEndContentError = false;
        s.ShowActivationLengthNaNError = false;
        s.ShowEndContentWithoutActivationLengthError = false;
    };
    var resetErrors = function() {
        s.ShowStartContentError = false;
        s.ShowAtleastOneWeekDayError = false;
        s.ShowActivationTimeError = false;
        s.ShowActivationLengthWithoutEndContentError = false;
        s.ShowActivationLengthNaNError = false;
        s.ShowEndContentWithoutActivationLengthError = false;
        s.ShowTimerSavedFeedback = false;
    };

    // init
    setDatePickerToPageTime();

    optionobj.SetSelected();
});




// helper functions / objects
var ActivationTimeMoreThanCurrentTime = function (diff, at) {
    var utc = Date.now();
    var ClientDate = new Date(utc + diff * 60000);
    return ClientDate < at;
};

var ConstructReadableDateString = function (date) {
    var hours = date.getUTCHours().toString().length === 1 ? "0" + date.getUTCHours() : date.getUTCHours();
    var minutes = date.getUTCMinutes().toString().length === 1 ? "0" + date.getUTCMinutes() : date.getUTCMinutes();
    var seconds = date.getUTCSeconds().toString().length === 1 ? "0" + date.getUTCSeconds() : date.getUTCSeconds();
    return date.getUTCDate() + "/" + (date.getUTCMonth() + 1) + "/" + date.getUTCFullYear() + " "
        + hours + ":" + minutes + ":" + seconds;
};
var ConstructReadableHourString = function (date) {
    var hours = date.getUTCHours().toString().length === 1 ? "0" + date.getUTCHours() : date.getUTCHours();
    var minutes = date.getUTCMinutes().toString().length === 1 ? "0" + date.getUTCMinutes() : date.getUTCMinutes();
    var seconds = date.getUTCSeconds().toString().length === 1 ? "0" + date.getUTCSeconds() : date.getUTCSeconds();
    return hours + ":" + minutes + ":" + seconds;
};
var isInt = function(n) { return parseInt(n) === n };
var createReadableActivationDaysString = function (activationDays) {
    var result = "";
    for (var i = 0; i < activationDays.length; i++) {
        var d = activationDays[i];
        if (d.Selected) {
            result += d.Day + ", ";
        }
    }
    return result.substring(0, result.length - 2); // cut off last ", "
};
function anyActivationsDaysSelected(ActivationsDays) {
    for (var i = 0; i < ActivationsDays.length; i++) {
        var d = ActivationsDays[i];
        if (d.Selected) return true;
    }
    return false;
}
