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
     * @param scope The calling scope
     * @param timer The timer to be edited
     * @param callback The function to be called when done editing timer. arg1 is the modified timer object.
     */
    this.ModifyTimerDialog = function (scope, timer, callback) {
        // copy of the timer to be modified
        scope.newTimer = new TimerObj(timer);

        prepareModifyTimerScope(scope);

        scope.checkInput = function () {
            // todo
            console.log("checking input");
            return true;
        };

        // init datepickers when dialog finish opening
        var diaOpenListener = $rootScope.$on('ngDialog.opened', function (e, $dialog) {
            var dialogDatepicker = $('#datetimepicker_date_dialog');
            var dialogHourpicker = $('#datetimepicker_hour_dialog');

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
            scope: scope
        });

        // if accept return the modified timer
        dialog.closePromise.then(function(data) {
            // calculate new timer values
            // todo

            diaOpenListener(); // unsubscribes from broadcast
            if (data.value === 1) {
                callback(scope.newTimer);
            }
        });
    };
    function prepareModifyTimerScope (s) {
        s.StartContentAddIcon = "pages/Pics/AdditionGreen.png";
        s.EndContentAddIcon = "pages/Pics/AdditionGreen.png";
        s.ActivationDays = angular.copy(s.newTimer.ActivationDays);
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
});