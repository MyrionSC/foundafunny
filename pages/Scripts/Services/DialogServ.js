app.service('dialogService', function ($rootScope, ngDialog, TimerObj, contentService) {
    var that = this;

    /**
     * Calls a dialog from which one can add/remove strings to an array of strings
     * @param callerScope $Scope: The scope of the caller
     * @param caller String: The caller of the function
     * @param textInput String: The string starting in the input field
     * @param contentArray Array<String>: The Array starting in the array field
     * @param acceptCallback Function(Array<String> returnArray): The callback on dialog accept
     */
    this.ModifyContentDialog = function (callerScope, caller, textInput, contentArray, acceptCallback) {
        // create new scope to pass to dialog
        var s = PrepareNewAddDialogScope(callerScope, caller, textInput, contentArray);

        var dialog = ngDialog.open({
            template: 'pages/View/Dialogs/AddContentDialog.html',
            className: 'ngdialog-theme-default',
            scope: s
        });
        dialog.closePromise.then(function(data) {
            if (data.value === 1) {
                acceptCallback(s.AddDialogContentArray)
            }
        });
    };
    var PrepareNewAddDialogScope = function (s, caller, textInput, contentArray) {
        s.DialogCaller = caller;
        s.AddDialogInput = textInput;
        s.AddDialogContentArray = contentArray;
        s.AdditionIconSrc = "pages/Pics/AdditionGreen.png";

        s.AdditionIconMouseEnter = function() {
            s.AdditionIconSrc = "pages/Pics/AdditionDarkGreen.png";
        };
        s.AdditionIconMouseLeave = function() {
            s.AdditionIconSrc = "pages/Pics/AdditionGreen.png";
        };

        s.DialogAddContent = function() {
            if (s.AddDialogInput != "") {
                s.AddDialogContentArray.push(s.AddDialogInput);
                s.AddDialogInput = "";
            }
        };
        s.DialogAddContentKeyPress = function(event) {
            if (event.keyCode === 13) { // enter key
                s.DialogAddContent();
            }
        };
        s.DialogRemoveListItem = function(index) {
            s.AddDialogContentArray.splice(index, 1);
        };

        return s;
    };

    /**
     * A dialog for conforming whether a user really wants to delete a timer
     * @param scope The calling scope
     * @param callback the callback. if data.value === 1, dialog was accepted, otherwise denied
     */
    this.DeleteTimerConfirmDialog = function (scope, callback) {
        var dialog = ngDialog.open({
            template: 'pages/View/Dialogs/TimerDeleteConfirmDialog.html',
            className: 'ngdialog-theme-default',
            scope: scope
        });
        dialog.closePromise.then(function(data) {
            callback(data);
        });
    };

    /**
     * A dialog for editing a timer object
     * @param s The calling scope
     * @param timer The timer to be edited
     * @param callback The function to be called when done editing timer. arg1 is the modified timer object.
     */
    this.ModifyTimerDialog = function (s, timer, callback) {
        // copy of the timer to be modified
        s.newTimer = new TimerObj(timer);
        var dialogDatepicker;
        var dialogHourpicker;
        var at;

        prepareModifyTimerScope(s);

        // returns true if errors in input
        s.anyErrors = function () {
            resetErrors(s);
            var Errors = false;

            at = s.newTimer.Type === "OneTime" ? dialogDatepicker.data('datetimepicker').getDate()
                : dialogHourpicker.data('datetimepicker').getDate();

            // determine if any errors in input
            if (s.StartContent.length === 0) {
                s.ShowStartContentError = true;
                Errors = true;
            }
            if (s.newTimer.Type === "Weekly" && !anyActivationsDaysSelected(s.newTimer.ActivationDays)) {
                s.ShowAtleastOneWeekDayError = true;
                Errors = true;
            }
            if (s.newTimer.Type === "OneTime" && !ActivationTimeMoreThanCurrentTime(contentService.Page.Settings.offset, at)) {
                s.ShowActivationTimeError = true;
                Errors = true;
            }
            if (s.EndContent.length != 0 && (s.newTimer.ActivationLength === null || s.newTimer.ActivationLength === 0)) {
                s.ShowActivationLengthWithoutEndContentError = true;
                Errors = true;
            }
            if (!isInt(s.newTimer.ActivationLength)) {
                s.ShowActivationLengthNaNError = true;
                Errors = true;
            }
            if (s.newTimer.ActivationLength != 0 && s.EndContent.length === 0) {
                s.ShowEndContentWithoutActivationLengthError = true;
                Errors = true;
            }

            return Errors;
        };

        // init datepickers when dialog finish opening
        var diaOpenListener = $rootScope.$on('ngDialog.opened', function (e, $dialog) {
            dialogDatepicker = $('#datetimepicker_date_dialog');
            dialogHourpicker = $('#datetimepicker_hour_dialog');

            dialogDatepicker.datetimepicker({
                format: 'dd/MM/yyyy hh:mm:ss',
                language: 'en'
            });
            dialogHourpicker.datetimepicker({
                pickDate: false,
                format: 'hh:mm:ss',
                language: 'en'
            });

            var ClientDate = new Date(timer.OriginalActivationTime + contentService.Page.Settings.offset * 60000);
            dialogDatepicker.data('datetimepicker').setDate(ClientDate);
            dialogHourpicker.data('datetimepicker').setDate(ClientDate);
        });

        // call dialog
        var dialog = ngDialog.open({
            template: 'pages/View/Dialogs/TimerEditDialog.html',
            className: 'ngdialog-timer-edit InitialBoxSizing',
            closeByDocument: false,
            scope: s
        });

        // if accept return the modified timer
        dialog.closePromise.then(function(data) {
            diaOpenListener(); // unsubscribes from broadcast

            if (data.value === 1) {
                // calculate new timer values
                s.newTimer.calculateValues(s.StartContent, s.EndContent, at, contentService.Page,
                    contentService.Page);

                callback(s.newTimer);
            }
        });
    };
    function prepareModifyTimerScope (s) {
        s.StartContentAddIcon = "pages/Pics/AdditionGreen.png";
        s.EndContentAddIcon = "pages/Pics/AdditionGreen.png";
        s.StartContent = s.newTimer.StartContent.length + " content in list";
        s.EndContent = s.newTimer.EndContent.length === 0 ? "" : s.newTimer.EndContent.length + " content in list";
        s.ShowWeeklyTypes = s.newTimer.Type === "Weekly";
        s.StartContentDisabled = s.newTimer.StartContent.length > 0;
        s.EndContentDisabled = s.newTimer.EndContent.length > 0;
        s.ShowStartContentError = false;
        s.ShowAtleastOneWeekDayError = false;
        s.ShowActivationTimeError = false;
        s.ShowActivationLengthWithoutEndContentError = false;
        s.ShowActivationLengthNaNError = false;
        s.ShowEndContentWithoutActivationLengthError = false;


        s.setShowWeeklyTypes = function (val) {
            s.ShowAtleastOneWeekDayError = false;
            s.ShowWeeklyTypes = val;
        };
        s.StartContentMouseEnter = function() {
            s.StartContentAddIcon = "pages/Pics/AdditionDarkGreen.png";
        };
        s.StartContentMouseLeave = function() {
            s.StartContentAddIcon = "pages/Pics/AdditionGreen.png";
        };
        s.AddAdditionalStartContent = function(timer) {
            var AddDialogInput = timer.StartContent.length === 0 ? s.StartContent : "";
            that.ModifyContentDialog(s, "start", AddDialogInput, timer.StartContent.slice(),
                function (contentArray) {
                    timer.StartContent = contentArray.slice();

                    console.log(timer.StartContent);
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

        s.EndContentMouseEnter = function() {
            s.EndContentAddIcon = "pages/Pics/AdditionDarkGreen.png";
        };
        s.EndContentMouseLeave = function() {
            s.EndContentAddIcon = "pages/Pics/AdditionGreen.png";
        };
        s.AddAdditionalEndContent = function(timer) {
            var AddDialogInput = timer.EndContent.length === 0 ? s.EndContent : "";
            that.ModifyContentDialog(s, "end", AddDialogInput, timer.EndContent.slice(),
                function (contentArray) {
                    timer.EndContent = contentArray.slice();

                    console.log(timer.EndContent);
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
    }
    function anyActivationsDaysSelected(ActivationsDays) {
        for (var i = 0; i < ActivationsDays.length; i++) {
            var d = ActivationsDays[i];
            if (d.Selected) return true;
        }
        return false;
    }
    function ActivationTimeMoreThanCurrentTime(diff, at) {
        var utc = Date.now();
        var ClientDate = new Date(utc + diff * 60000);
        return ClientDate < at;
    }

    function resetErrors(s) {
        s.ShowStartContentError = false;
        s.ShowAtleastOneWeekDayError = false;
        s.ShowActivationTimeError = false;
        s.ShowActivationLengthWithoutEndContentError = false;
        s.ShowActivationLengthNaNError = false;
        s.ShowEndContentWithoutActivationLengthError = false;
    }
});