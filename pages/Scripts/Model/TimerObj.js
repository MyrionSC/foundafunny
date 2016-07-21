// contains the Timer object
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
            this._id = src._id;
        },
        newTimer: function () {
            this.PageName = "";
            this.Name = "";
            this.StartContent = [];
            this.Type = "OneTime";
            this.ActivationDays = [
                {Day: "Mon", Selected: false},
                {Day: "Tue", Selected: false},
                {Day: "Wed", Selected: false},
                {Day: "Thu", Selected: false},
                {Day: "Fri", Selected: false},
                {Day: "Sat", Selected: false},
                {Day: "Sun", Selected: false}
            ];
            this.ActivationDaysReadable = "";
            this.ActivationTime = 0;
            this.OriginalActivationTime = 0;
            this.ActivationTimeReadable = "";
            this.ActivationLength = 0;
            this.EndContent = [];
            this.Active = false;
        },

        calculateValues: function (sc, ec, actiTime, page) {
            if (this.StartContent.length === 0) {
                this.StartContent.push(sc);
            }
            if (this.EndContent.length === 0 && ec != "") {
                this.EndContent.push(ec);
            }
            this.ActivationTimeReadable = this.Type === "OneTime" ?
                ConstructReadableDateString(actiTime) : ConstructReadableHourString(actiTime);

            // // convert datetimepicker time back to utc, which is the only thing the server deals in
            var timeDiffNeg = page.Settings.offset * -1;
            this.OriginalActivationTime = this.ActivationTime = actiTime.getTime() + timeDiffNeg * 60000;
            if (this.Type === "Weekly") {
                this.ActivationDaysReadable = createReadableActivationDaysString(this.ActivationDays);
            }
            this.PageName = page.Name;
        }
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

    return TimerObj;
});

