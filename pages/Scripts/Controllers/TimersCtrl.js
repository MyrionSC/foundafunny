app.controller('TimersCtrl', function($scope, $location, sidebarService, contentService, dialogService) {
    var s = $scope;
    var optionobj = sidebarService.vtInfoObj;

    s.OneTimeTimerArray = [];
    s.WeeklyTimerArray = [];
    s.ShowLoadingTimers = true;
    s.ShowTimerList = false;
    s.ShowNoTimers = false;
    s.ShowNoWeeklyTimers = false;
    s.ShowNoOneTimeTimers = false;

    s.OneTimeButton = {
        BgColor: "rgb(84, 225, 84)",
        Selected: true,
        TimerCount: 0
    };
    s.WeeklyButton = {
        BgColor: "rgb(221, 221, 221)",
        Selected: false,
        TimerCount: 0
    };

    s.GetTimers = function () {
        contentService.GetTimers(function (content) {
            for (var i = 0; i < content.length; i++) {
                content[i].DeleteIconSrc = "pages/Pics/TrashBinDarkGrey.png";
                content[i].EditIconSrc = "pages/Pics/EditIconDarkGrey.png";
            }

            // sort the timers into their respective arrays
            for (var i = 0; i < content.length; i++) {
                if (content[i].Type === "OneTime")
                    s.OneTimeTimerArray.push(content[i]);
                else
                    s.WeeklyTimerArray.push(content[i]);
            }

            if (s.OneTimeTimerArray.length === 0 && s.WeeklyTimerArray.length != 0) {
                SetSelected(s.WeeklyButton);
                SetDeselected(s.OneTimeButton);
            }

            updateVars();

            console.log("Timers gotten:");
            console.log(s.OneTimeTimerArray);
            console.log(s.WeeklyTimerArray);

            s.ShowLoadingTimers = false;
            if (s.OneTimeTimerArray.length === 0 && s.WeeklyTimerArray.length === 0)
                s.ShowNoTimers = true;
            else
                s.ShowTimerList = true;
        });
    };

    s.TypePickerMouseEnter = function(obj) {
        if (!obj.Selected) {
            SetBgLightGreen(obj);
        }
    };
    s.TypePickerMouseLeave = function(obj) {
        if (!obj.Selected) {
            SetBgStandard(obj);
        }
    };
    s.TypePickerClick = function(obj, opposite_obj) {
        if (!obj.Selected) {
            SetSelected(obj);
            SetDeselected(opposite_obj)
        }
    };

    // delete timer
    s.DeleteIconEnter = function(t) {
        t.DeleteIconSrc = "pages/Pics/TrashBinBlack.png";
    };
    s.DeleteIconLeave = function(t) {
        t.DeleteIconSrc = "pages/Pics/TrashBinDarkGrey.png";
    };
    s.DeleteIconClick = function(t) {
        // Open dialog window to make sure deletion is intended
        dialogService.DeleteTimerConfirmDialog(s, function (data) {
            if (data.value === 1) {
                deleteTimer(t);
            }
        });
    };
    var deleteTimer = function (t) {
        console.log("Deleting timer locally");

        if (t.Type === "OneTime")
            s.OneTimeTimerArray.splice(FindTimerIndex(s.OneTimeTimerArray, t._id), 1);
        else
            s.WeeklyTimerArray.splice(FindTimerIndex(s.WeeklyTimerArray, t._id), 1);

        updateVars();

        // delete this timer in db and notify server
        console.log("Requesting deletion of timer on server");
        contentService.PushTimerDeleteToServer(t);
    };

    // edit timer
    s.EditIconEnter = function(t) {
        t.EditIconSrc = "pages/Pics/EditIconBlack.png";
    };
    s.EditIconLeave = function(t) {
        t.EditIconSrc = "pages/Pics/EditIconDarkGrey.png";
    };
    s.EditIconClick = function(t) {
        // Open dialog window to make sure deletion is intended
        dialogService.ModifyTimerDialog(s, t, function (timer) {
            alert(timer.ActivationTime);
        })
    };


    
    
    
    
    
    // init
    s.GetTimers();

    s.$on('update-timers', function () {
        resetValues();
        s.GetTimers();
    });

    var resetValues = function() {
        s.OneTimeTimerArray = [];
        s.WeeklyTimerArray = [];
        s.ShowLoadingTimers = true;
        s.ShowTimerList = false;
        s.ShowNoTimers = false;
        s.ShowNoWeeklyTimers = false;
        s.ShowNoOneTimeTimers = false;
    };
    var updateVars = function() {
        s.OneTimeButton.TimerCount = s.OneTimeTimerArray.length;
        s.WeeklyButton.TimerCount = s.WeeklyTimerArray.length;

        s.ShowNoWeeklyTimers = s.WeeklyButton.TimerCount === 0;
        s.ShowNoOneTimeTimers = s.OneTimeButton.TimerCount === 0;
    };

    optionobj.SetSelected();
});

var SetSelected = function(obj) {
    obj.Selected = true;
    SetBgGreen(obj);
};
var SetDeselected = function(obj) {
    obj.Selected = false;
    SetBgStandard(obj);
};
var SetBgGreen = function (obj) {
    obj.BgColor = 'rgb(84, 225, 84)';
};
var SetBgLightGreen = function (obj) {
    obj.BgColor = 'rgb(128, 225, 128)';
};
var SetBgStandard = function (obj) {
    obj.BgColor = 'rgb(221, 221, 221)';
};

var FindTimerIndex = function (array, timerid) {
    for (var i = 0; i < array.length; i++) {
        if (array[i]._id === timerid)
            return i;
    }
};