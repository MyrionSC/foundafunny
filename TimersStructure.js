/*
 * This object/export is an encapsulation of the list of active timers in sdm
 */

var console = process.console; // for logs
var exports = module.exports = {};
var io, db; // are filled after handshake from socket.js
var timers = [];

exports.SocketHandshake = function(IO) {
    console.log("Starting socket handshake");

    io = IO;
    db = IO.db;

    InitTimerStruct();
};

// get timers in db, check if they are still good, insert the good ones in timer structure
var InitTimerStruct = function() {
    PrintInitTimerStructMessage();

    db.getAllTimers(function(err, pages) {
        if (err) return console.error(err);
        console.log("Number of pages retrieved from db: " + pages.length);
        //console.log("return pages from db:");
        //console.log(pages);
        //console.log();
        console.log("Current Time is " + new Date().toString());
        console.log("Starting init of timer structure");
        console.log();
        var n = 0;
        for (var i = 0; i < pages.length; i++) {
            var p = pages[i];
            console.log("Checking timers in page:");
            console.log(p);
            for (var j = 0; j < p.Timers.length; j++) {
                var t = p.Timers[j];
                console.log();

                if (t.Type === "Weekly") {
                    console.log("Checking against weekly timer with Activation Time: " + new Date(t.ActivationTime).toString());
                    UpdateActivationTime(t, false);
                    insertTimerInStruct(t)
                }
                else {
                    var now = new Date(Date.now());
                    console.log("Checking against Single timer with Activation Time: " + new Date(t.ActivationTime).toString());

                    if (t.ActivationTime > now.getTime()) {
                        console.log("Timer is good, inserting into struct");
                        insertTimerInStruct(t);
                    }
                    else {
                        console.log("Timer removed");
                        t.remove();
                    }
                }
                n++;
            }

            p.save(function(err, obj) {
                if (err) {
                    console.log("An error occured in the saving of page:");
                    console.log(p);
                    return console.log(err);
                }
            });
        }

        console.log();
        console.log("Struct init is done");
        console.log("Number of timers found in db: " + n);
        console.log("Number of timers inserted into timestruct at init: " + timers.length);
        if (timers.length != 0) {
            console.log("id and activation time of the timers from first to last:");
            for (var i = 0; i < timers.length; i++) {
                console.log("id: " + timers[i]._id + ", Activation Time: " + new Date(timers[i].ActivationTime).toString());
            }
        }
        console.log();

        // after all timers have been inserted or deleted, start interval
        StartCheckInterval();
    });
};

var StartCheckInterval = function() {
    var i = 0;
    console.log("Starting timer check interval");
    if (anyTimers()) {
        console.log("Next timer activation at: " + new Date(getNextTimer().ActivationTime).toString());
    }
    else {
        console.log("There are currently no timers in the timer struct");
    }


    setInterval(function() {
        //if (i % 10 === 0) {
        //    console.log("Number of timers currently in struct: " + timers.length);
        //    i = 0;
        //}
        //i++;

        CheckIfTimerActivation();
    }, 1000);
};


var getNextTimer = function() {
    if (timers.length != 0)
        return timers[0];
    return -1;
};
var insertTimerInStruct = exports.insertTimerInStruct = function(timer) {
    console.log("Inserting timer with activation time into struct: " + new Date(timer.ActivationTime).toString());
    if (timers.length != 0) {
        for (var i = 0, j = timers.length; i < j; i++) {
            var t = timers[i];

            console.log("Comparing against timer at index " + i + ", with activation time: " + new Date(t.ActivationTime));
            if (timer.ActivationTime < t.ActivationTime) {
                console.log("new timer inserted at spot " + i);
                timers.splice(i, 0, timer);
                break;
            }
            else {
                console.log("no go for spot " + i + ". Moving on.");
                if (i === timers.length - 1) {
                    console.log("new timer inserted at the end of timerstruct");
                    timers.push(timer);
                    break;
                }
            }
        }
    }
    else {
        console.log("No timers to compare against, struct is empty, inserting at index 0");
        timers.push(timer);
    }

    console.log("timer with id inserted into timestruct: " + timer._id);
    console.log("Number of timers now in struct: " + timers.length);
    if (anyTimers())
        console.log("Next timer activation: " + new Date(getNextTimer().ActivationTime).toString());
};
var removeTimerFromStruct = function() {
    if (timers.length != 0) {
        var timer = timers.shift();
        console.log("timer with id removed from timestruct " + timer._id);

        if (getNextTimer() != -1)
            console.log("Next timer activation: " + new Date(getNextTimer().ActivationTime).toString());

        console.log("Number of timers now in struct: " + timers.length);

        return 1;
    }
    return -1;
};
exports.removeTimerFromStructById = function(timerid) {
    console.log("Trying to remove timer from timer struct");
    if (timers.length != 0) {
        var index = FindTimerIndexById(timers, timerid);
        if (index != undefined) {
            timers.splice(index, 1);
            console.log("Timer with id " + timerid + " removed from timer struct at index " + index);
            return 1;
        }
        else {
            console.log("Timer removal failed: No timer with id " + timerid + " exists in timer struct");
            return-1
        }
    }
    console.log("Timer removal failed: No timers in struct");
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
            console.log();
            console.log("Timer activation registered");

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

    if (!EndContentFlag) {
        db.SaveContent(timer.PageName, timer.StartContent, function() {
            io.PushTimerPackage(timer.PageName, timer.StartContent);
        });
    }
    else {
        db.SetPageTimerActiveAndSaveContent(timer.PageName, timer._id, timer.StartContent, function() {
            io.PushTimerPackage(timer.PageName, timer.StartContent);
        });

        console.log("End content timer startet:");
        console.log("Activation in: " + timer.ActivationLength + " seconds\n");

        // start new timer for endcontent
        timer.TimeoutVar = setTimeout(function () {
            db.SetPageTimerInactiveAndSaveContent(timer.PageName, timer._id, timer.EndContent, function() {
                // push content to user
                io.PushTimerPackage(timer.PageName, timer.EndContent);
            });
        }, timer.ActivationLength * 1000);
    }
};
var ActivateOneTimeTimer = function(timer) {
    console.log("Single timer activated:");
    console.log(timer);
    var EndContentFlag = timer.EndContent != "";

    // based on EndContentFlag, delete or set timer active, and push content update to user
    if (!EndContentFlag) {
        db.DeletePageTimerAndSaveContent(timer.PageName, timer._id, timer.StartContent, function () {
            io.PushTimerPackage(timer.PageName, timer.StartContent);
        });
    }
    else {
        // if there is endcontent, start a new timer of Activation Length
        db.SetPageTimerActiveAndSaveContent(timer.PageName, timer._id, timer.StartContent, function () {
            io.PushTimerPackage(timer.PageName, timer.StartContent);
        });

        console.log("End content timer startet:");
        console.log("Activation in: " + timer.ActivationLength + " seconds\n");
        // start new timer for endcontent
        timer.TimeoutVar = setTimeout(function () {
            db.DeletePageTimerAndSaveContent(timer.PageName, timer._id, timer.EndContent, function () {
                // push content to user
                io.PushTimerPackage(timer.PageName, timer.EndContent);
            });
        }, timer.ActivationLength * 1000);
    }
};

// should only be called on weekly timers
var UpdateActivationTime = exports.UpdateActivationTime = function(timer, Save) {
    var today = new Date(Date.now()); // current date in utc
    //console.log("today utc time:");
    //console.log(today.toTimeString());
    //console.log(today.getTime());

    var timerdate = new Date(timer.ActivationTime);
    AlignDates(timerdate, today);

    // if timer Activation time is later today, and today is an activation day
    // then everything is fine. If not, find the next activation day from today
    // and add that to the timers date, in utc time
    if (timer.ActivationDays[today.getDay() - 1].Selected != true ||
        (timer.ActivationDays[today.getDay() - 1].Selected == true &&
        today.getTime() > timerdate.getTime())) {

        timerdate.setDate(timerdate.getDate() + FindDaysUntilNextActivation(timer));
        console.log("Activation Time of timer with id " + timer._id + " is now: " + timerdate.toString());
    }

    timer.ActivationTime = timerdate.getTime();

    if (Save)
        db.UpdatePageTimerActivationTime(timer.PageName, timer._id, timer.ActivationTime);
};

var FindDaysUntilNextActivation = function (timer) {
    var today = new Date();
    var todayWeekday = today.getDay() - 1;

    var res = 1;
    for (var i = 0; i < timer.ActivationDays.length; i++) {
        var index = ((todayWeekday + 1 + i) % 7);
        var obj = timer.ActivationDays[index];

        if (obj.Selected === true) {
            //console.log("Next Activation time in " + res + " days");
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

var PrintInitTimerStructMessage = function() {
    console.log("Initializing timer struct");
    console.log("Getting timers in database");
};
var FindTimerIndexById = function(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i]._id.toString() === id)
            return i;
    }
};