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

        // call dialog
        var dialog = ngDialog.open({
            template: 'pages/View/Dialogs/TimerEditDialog.html',
            className: 'ngdialog-theme-default InitialBoxSizing',
            scope: scope
        });

        // if accept return the modified timer
        dialog.closePromise.then(function(data) {
            if (data.value === 1) {
                callback(scope.newTimer);
            }
        });
    }
});