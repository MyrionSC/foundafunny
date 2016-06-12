app.service('dialogService', function (ngDialog, TimerObj) {
    var that = this;

    /**
     * Calls a dialog from which one can add/remove strings to an array of strings
     * @param callerScope $Scope: The scope of the caller
     * @param caller String: The caller of the function
     * @param textInput String: The string starting in the input field
     * @param contentArray Array<String>: The Array starting in the array field
     * @param acceptCallback Function(Array<String> returnArray): The callback on dialog accept
     * @param rejectCallback Function(): The callback on dialog reject
     */
    this.ModifyContentDialog = function (callerScope, caller, textInput, contentArray, acceptCallback, rejectCallback) {
        // create new scope to pass to dialog
        var s = createNewAddDialogScope(callerScope, caller, textInput, contentArray);

        var dialog = ngDialog.open({
            template: 'pages/View/Dialogs/AddContentDialog.html',
            className: 'ngdialog-theme-default',
            scope: s
        });
        dialog.closePromise.then(function(data) {
            if (data.value === 1) {
                acceptCallback(s.AddDialogContentArray)
            } else if (data.value === 0) {
                rejectCallback();
            }
        });
    };
    var createNewAddDialogScope = function (callerScope, caller, textInput, contentArray) {
        var s = callerScope.$new();

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

    this.ModifyTimerDialog = function (scope, timer, callback) {
        // copy of the timer to be modified
        scope.newTimer = new TimerObj(timer);

        prepareModifyTimerScope(scope);

        scope.checkInput = function () {
            console.log("checking input");
            return true;
        };

        // call dialog
        var dialog = ngDialog.open({
            template: 'pages/View/Dialogs/TimerEditDialog.html',
            className: 'ngdialog-timer-edit InitialBoxSizing',
            closeByDocument: false,
            scope: scope
        });
        // if accept return the modified timer
        dialog.closePromise.then(function(data) {
            if (data.value === 1) {
                callback(scope.newTimer);
            }
        });
    };
    function prepareModifyTimerScope (s) {
        s.StartContentAddIcon = "pages/Pics/AdditionGreen.png";
        s.EndContentAddIcon = "pages/Pics/AdditionGreen.png";
        s.StartContent = "";
        s.EndContent = "";
        s.ShowWeeklyTypes = false;
        s.SelectedWeekDays = [];
        s.StartContentDisabled = false;
        s.EndContentDisabled = false;
        s.ShowStartContentError = false;
        s.ShowAtleastOneWeekDayError = false;
        s.ShowActivationTimeError = false;
        s.ShowActivationLengthWithoutEndContentError = false;
        s.ShowActivationLengthNaNError = false;
        s.ShowEndContentWithoutActivationLengthError = false;

        if (s.newTimer.StartContent.length === 1) {
            s.StartContent = s.newTimer.StartContent[0];
        } else {
            s.StartContent = s.newTimer.StartContent.length + " content in list";
            s.StartContentDisabled = true;
        }
        if (s.newTimer.EndContent.length === 0) {
            s.EndContent = "";
        } else if (s.newTimer.EndContent.length === 1) {
            s.EndContent = s.newTimer.EndContent[0];
        } else {
            s.EndContent = s.newTimer.EndContent.length + " content in list";
            s.EndContentContentDisabled = true;
        }


        s.StartContentMouseEnter = function() {
            s.StartContentAddIcon = "pages/Pics/AdditionDarkGreen.png";
        };
        s.StartContentMouseLeave = function() {
            s.StartContentAddIcon = "pages/Pics/AdditionGreen.png";
        };
        s.AddAdditionalStartContent = function() {
            var AddDialogInput = s.newTimer.StartContent < 2 ? s.StartContent : "";
            that.ModifyContentDialog(s, "start", AddDialogInput, s.newTimer.StartContent.slice(),
                function (contentArray) {
                    s.newTimer.StartContent = contentArray.slice();

                    console.log(s.newTimer.StartContent);
                    if (contentArray.length > 1) {
                        s.StartContentDisabled = true;
                        s.StartContent = contentArray.length + " content in list";
                    } else {
                        s.StartContentDisabled = false;
                        if (contentArray.length === 0) {
                            s.StartContent = "";
                        } else { // if length === 1
                            s.StartContent = contentArray[0];
                        }
                    }
                }, function () {});
        };

        s.EndContentMouseEnter = function() {
            s.EndContentAddIcon = "pages/Pics/AdditionDarkGreen.png";
        };
        s.EndContentMouseLeave = function() {
            s.EndContentAddIcon = "pages/Pics/AdditionGreen.png";
        };
        s.AddAdditionalEndContent = function() {
            var AddDialogInput = s.newTimer.EndContent < 2 ? s.EndContent : "";
            that.ModifyContentDialog(s, "end", AddDialogInput, s.newTimer.EndContent.slice(),
                function (contentArray) {
                    s.newTimer.EndContent = contentArray.slice();

                    console.log(s.newTimer.EndContent);
                    if (contentArray.length > 1) {
                        s.EndContentDisabled = true;
                        s.EndContent = contentArray.length + " content in list";
                    } else {
                        s.EndContentDisabled = false;
                        if (contentArray.length === 0) {
                            s.EndContent = "";
                        } else { // if length === 1
                            s.EndContent = contentArray[0];
                        }
                    }
                }, function () {});
        };
    }
});