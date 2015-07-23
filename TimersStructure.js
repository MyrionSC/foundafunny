/*
 * This object/export is an encapsulation of the list of active timers in sdm
 */

var console = process.console; // for logs
var exports = module.exports = {};
var io, db; // are filled after handshake from socket.js
var timers = [];

exports.SocketHandshake = function(IO) {
    io = IO;
    db = IO.db;

    InitTimerStruct();
};

// get timers in db, check if they are still good, insert the good ones in timer structure
var InitTimerStruct = function() {
    db.getAllTimers(function(err, pages) {
        if (err) return console.error(err);
        for (var i = 0; i < pages.length; i++) {
            var p = pages[i];
            for (var j = 0; j < p.Timers.length; j++) {
                var t = p.Timers[j];

                if (t.Type === "Weekly") {
                    UpdateActivationTime(t, true);
                    insertTimerInStruct(t)
                }
                else {
                    var now = new Date();
                    if (t.ActivationTime < now.getTime()) {
                        insertTimerInStruct(t);
                    }
                    else {
                        db.DeletePageTimer(t.PageName, t.id);
                    }
                }
            }
        }

        // after all timers have been inserted or deleted, start interval
        StartCheckInterval();
    });
};

var StartCheckInterval = function() {
    setInterval(function() {
        CheckIfTimerActivation();
    }, 1000);
};


var getNextTimer = exports.getNextTimer = function() {
    if (timers.length != 0)
        return timers[0];
    return -1;
};
var insertTimerInStruct = exports.insertTimerInStruct = function(timer) {
    if (timers.length != 0) {

        for (var i = 0; i < timers.length; i++) {
            var t = timers[i];

            if (timer.ActivationTime < t.ActivationTime) {
                timers.splice(i, 0, timer);
                console.log("new timer inserted at spot " + i);
                break;
            }
            else {
                i++;
            }
        }
    }
    else {
        timers.push(timer);
    }

    console.log("timer with id inserted into timestruct: " + timer.id);
    if (getNextTimer != -1)
        console.log("Next timer activation: " + new Date(getNextTimer.ActivationTime).toString());
};
var removeTimerFromStruct = exports.removeTimerFromStruct = function() {
    if (timers.length != 0) {
        var timer = timers.shift();
        console.log("timer with id removed from timestruct " + timer.id);

        if (getNextTimer != -1)
            console.log("Next timer activation: " + new Date(getNextTimer.ActivationTime).toString());

        return 1;
    }
    return -1;
};
var anyTimers = function() {
    return timers.length != 0;
};
var CheckIfTimerActivation = function() {
    if (anyTimers()) {
        //console.log("timers in queue: " + timers.length);
        var now = Date.now();
        var NextTimer = getNextTimer();

        //console.log("Now: " + new Date(now).toString());
        //console.log("Next Timer Activation: " + new Date(NextTimer.ActivationTime).toString());
        //console.log();

        if (NextTimer != -1 && now > NextTimer.ActivationTime){
            // remove the timer from timerstruct
            removeTimerFromStruct();

            // Perform timer activation
            ActivateTimer(NextTimer);

            if (NextTimer.Type === "Weekly") {
                // update and insert next timer activation date into timerstruct
                UpdateActivationTime(NextTimer, true);
                insertTimerInStruct(NextTimer);
            }

            // check again to see if any new timers have activated this second
            CheckIfTimerActivation();
        }
    }
};

var ActivateTimer = function(timer) {
    if (timer.Type === "OneTime")
        ActivateOneTimeTimer(timer);
    else {
        ActivateWeeklyTimer(timer);
    }
};
var ActivateWeeklyTimer = function (timer) {
    console.log("Weekly timer activated:");
    console.log(timer);
    var EndContentFlag = timer.EndContent != "";

    io.PushTimerPackage(timer.PageName, timer.StartContent);

    if (!EndContentFlag) {
        db.SaveContent(timer.PageName, timer.StartContent);
    }
    else {
        db.SetPageTimerActiveAndSaveContent(timer.PageName, timer.id, timer.StartContent);

        console.log("End content timer startet:");
        console.log("Activation in: " + timer.ActivationLength + " seconds\n");

        // start new timer for endcontent
        timer.TimeoutVar = setTimeout(function () {
            db.SetPageTimerInactiveAndSaveContent(timer.PageName, timer.id, timer.EndContent);

            // push content to user
            io.PushTimerPackage(timer.PageName, timer.EndContent);
        }, timer.ActivationLength * 1000);
    }
};
var ActivateOneTimeTimer = function(timer) {
    console.log("Single timer activated:");
    console.log(timer);
    var EndContentFlag = timer.EndContent != "";

    // based on EndContentFlag, delete or set timer active
    if (EndContentFlag)
        db.SetPageTimerActiveAndSaveContent(timer.PageName, timer.id, timer.StartContent);
    else
        db.DeletePageTimerAndSaveContent(timer.PageName, timer.id, timer.StartContent);

    // push content to user
    io.PushTimerPackage(timer.PageName, timer.StartContent);

    // if there is endcontent, start a new timer of Activation Length
    if (EndContentFlag) {
        console.log("End content timer startet:");
        console.log("Activation in: " + timer.ActivationLength + " seconds\n");
        // start new timer for endcontent
        timer.TimeoutVar = setTimeout(function () {
            db.DeletePageTimerAndSaveContent(timer.PageName, timer.id, timer.EndContent);

            // push content to user
            io.PushTimerPackage(timer.PageName, timer.EndContent);
        }, timer.ActivationLength * 1000);
    }
};

// should only be called on weekly timers
var UpdateActivationTime = exports.UpdateActivationTime = function(timer, Save) {
    var today = new Date(Date.now()); // current date in utc
    console.log("today utc time:");
    console.log(today.toTimeString());
    console.log(today.getTime());

    var timerdate = new Date(timer.ActivationTime);
    AlignDates(timerdate, today);

    // if timer Activation time is later today, and today is an activation day
    // then everything is fine. If not, find the next activation day from today
    // and add that to the timers date, in utc time
    if (timer.ActivationDays[today.getDay() - 1].Selected != true ||
        (timer.ActivationDays[today.getDay() - 1].Selected == true &&
        today.getTime() > timerdate.getTime())) {

        timerdate.setDate(timerdate.getDate() + FindDaysUntilNextActivation(timer));
    }

    timer.ActivationTime = timerdate.getTime();

    if (Save)
        db.UpdatePageTimerActivationTime(timer.PageName, timer.id, timer.ActivationTime);
};

var FindDaysUntilNextActivation = function (timer) {
    var today = new Date();
    var todayWeekday = today.getDay() - 1;

    var res = 1;
    for (var i = 0; i < timer.ActivationDays.length; i++) {
        var index = ((todayWeekday + 1 + i) % 7);
        var obj = timer.ActivationDays[index];

        if (obj.Selected === true) {
            console.log("Next Activation time in " + res + " days");
            return res;
        }
        // else
        res++;
    }
};
var AlignDates = function(date, today) {
    date.setDate(today.getDate());
    date.setMonth(today.getMonth());
    date.setFullYear(today.getFullYear());
};