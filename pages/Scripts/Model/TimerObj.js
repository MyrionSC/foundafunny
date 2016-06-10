// contains the models of the found a funny client
app.factory('TimerObj', function () {
    function TimerObj (oldTimer) {
        if (oldTimer) {
            this.copyTimer(oldTimer);
        } else {
            this.newTimer();
        }
    }
    TimerObj.prototype = {
        copyTimer: function (src) {
            this.PageName = src.PageName;
            this.Name = src.Name;
            this.StartContent = angular.copy(src.StartContent);
            this.Type = src.Type;
            this.ActivationDays = angular.copy(src.ActivationDays);
            this.ActivationDaysReadable = src.ActivationDaysReadable;
            this.ActivationTime = src.ActivationTime;
            this.OriginalActivationTime = src.OriginalActivationTime;
            this.ActivationTimeReadable = src.ActivationTimeReadable;
            this.ActivationLength = src.ActivationLength;
            this.EndContent = angular.copy(src.EndContent);
            this.Active = src.Active;
        },
        newTimer: function () {
            this.PageName = "";
            this.Name = "";
            this.StartContent = [];
            this.Type = "OneTime";
            this.ActivationDays = [];
            this.ActivationDaysReadable = "";
            this.ActivationTime = 0;
            this.OriginalActivationTime = 0;
            this.ActivationTimeReadable = "";
            this.ActivationLength = 0;
            this.EndContent = [];
            this.Active = false;
        }
    };

    return TimerObj;
});

