app.service('dialogService', function (ngDialog) {
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
    this.AddOrRemoveContentDialog = function (callerScope, caller, textInput, contentArray, acceptCallback, rejectCallback) {
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

        s.EndContentMouseEnter = function() {
            s.EndContentAddIcon = "pages/Pics/AdditionDarkGreen.png";
        };
        s.EndContentMouseLeave = function() {
            s.EndContentAddIcon = "pages/Pics/AdditionGreen.png";
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


    // s.AddAdditionalEndContent = function() {
    //     s.AddDialogContentArray = s.Timer.EndContent.slice(); // copies timers StartContent array
    //     if (s.Timer.EndContent < 2) {
    //         s.AddDialogInput = s.EndContent;
    //     } else {
    //         s.AddDialogInput = "";
    //     }
    //     s.DialogCaller = "end";
    //
    //     var AddStartContentDialog = ngDialog.open({
    //         template: 'pages/View/Dialogs/AddContentDialog.html',
    //         className: 'ngdialog-theme-default',
    //         scope: s
    //     });
    //     AddStartContentDialog.closePromise.then(function(data) {
    //         if (data.value === 1) {
    //             s.Timer.EndContent = s.AddDialogContentArray.slice();
    //             console.log(s.Timer.EndContent.length);
    //
    //             if (s.Timer.EndContent.length > 1) {
    //                 s.EndContentDisabled = true;
    //                 s.EndContent = s.Timer.EndContent.length + " content in list";
    //             } else {
    //                 s.EndContentDisabled = false;
    //                 if (s.Timer.EndContent.length === 0) {
    //                     s.EndContent = "";
    //                 } else { // if length === 1
    //                     s.EndContent = s.Timer.EndContent[0];
    //                 }
    //             }
    //
    //             s.AddDialogContentArray = [];
    //         }
    //     });
    // };
    // s.EndContentMouseEnter = function() {
    //     s.EndContentAddIcon = "pages/Pics/AdditionDarkGreen.png";
    // };
    // s.EndContentMouseLeave = function() {
    //     s.EndContentAddIcon = "pages/Pics/AdditionGreen.png";
    // };
    //
    // s.DialogAddContent = function() {
    //     s.AddDialogContentArray.push(s.AddDialogInput);
    //     s.AddDialogInput = "";
    // };
    // s.DialogAddContentKeyPress = function(event) {
    //     if (event.keyCode === 13) { // enter key
    //         s.DialogAddContent();
    //     }
    // };
    // s.DialogRemoveListItem = function(index) {
    //     s.AddDialogContentArray.splice(index, 1);
    // };
});