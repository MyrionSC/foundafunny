/*
 * This object/export is an encapsulation of the list of active timers in sdm
 */

var console = process.console; // for logs
var exports = module.exports = {};
var io, db; // are filled after handshake from socket.js
var timers = [];
var pages = require("./Pages.js");
var TestNoTimers = false; // for testing the server without timers


exports.SocketHandshake = function (IO) {
    console.log("Starting socket handshake");

    io = IO;
    db = IO.db;

    if (TestNoTimers === false)
        InitTimerStruct();
    else
        console.log("\nTesting without timers");
};

// get timers in db, check if they are still good, insert the good ones in timer structure
var InitTimerStruct = function () {
    if (pages.initDone) {
        PrintInitTimerStructMessage();
        db.getAllTimers(function (err, pages) {
            if (err) return console.error(err);
            console.log("Number of pages retrieved from db: " + pages.length);
            //console.log("return pages from db:");
            //console.log(pages);
            //console.log("\n"
            console.log("Current Time is " + new Date().toString());
            console.log("*");
            var n = 0;
            for (var i = 0; i < pages.length; i++) {
                var p = pages[i];
                console.log("---Checking " + p.Timers.length + " timers in page: " + p.Name);
                console.log("-");
                for (var j = 0; j < p.Timers.length; j++) {
                    var t = p.Timers[j];

                    if (t.Type === "Weekly") {
                        console.log("Checking against weekly timer with Activation Time: " + new Date(t.ActivationTime).toString());
                        UpdateActivationTime(t, false);
                        insertTimerInStruct(t)
                    }
                    else {
                        var now = new Date(Date.now());
                        console.log("Checking against Single timer with Activation Time: " + new Date(t.ActivationTime).toString());

                        if (t.OriginalActivationTime > now.getTime()) {
                            console.log("Timer is good, inserting into struct");
                            insertTimerInStruct(t);
                        }
                        else {
                            console.log("Timer removed");
                            t.remove();
                        }
                    }
                    n++;
                    console.log("-");
                }

                p.save(function (err, obj) {
                    if (err) {
                        console.log("An error occured in the saving of page:");
                        console.log(p);
                        return console.log(err);
                    }
                });
            }

            console.log("---Timer structure initialization is done");
            console.log("Number of timers found in db: " + n);
            console.log("Number of timers inserted into timestruct at init: " + timers.length);
            if (timers.length != 0) {
                console.log("id and activation time of the timers from first to last:");
                for (var i = 0; i < timers.length; i++) {
                    console.log("id: " + timers[i]._id + ", Activation Time: " + new Date(timers[i].ActivationTime).toString());
                }
            }
            console.log("*");

            // after all timers have been inserted or deleted, start interval
            StartCheckInterval();
        });
    }
    else {
        // wait 50 seconds for page init to be done and try again
        setTimeout(function () {
            InitTimerStruct();
        }, 50);
    }
};

var StartCheckInterval = function () {
    console.log("Current Time is " + new Date().toString());
    console.log("Starting timer check interval");

    if (anyTimers()) {
        console.log("Next timer activation at: " + new Date(getNextTimer().ActivationTime).toString());
    } else {
        console.log("There are currently no timers in the timer struct");
    }

    setInterval(function () {
        CheckIfTimerActivation();
    }, 1000);
};


var getNextTimer = function () {
    if (timers.length != 0)
        return timers[0];
    return -1;
};
var insertTimerInStruct = exports.insertTimerInStruct = function (timer) {
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
var removeFrontTimerFromStruct = function () {
    if (timers.length != 0) {
        var timer = timers.shift();
        console.log("timer with id removed from timestruct " + timer._id);

        if (anyTimers())
            console.log("Next timer activation: " + new Date(getNextTimer().ActivationTime).toString());

        console.log("Number of timers now in struct: " + timers.length);

        return 1;
    }
    return -1;
};
var removeTimerFromStructById = exports.removeTimerFromStructById = function (timerid) {
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
            return -1
        }
    }
    console.log("Timer removal failed: No timers in struct");
    return -1;
};

exports.updateTimersTimezone = function (pagename, settings, offsetDiff) {
    var timersToUpdate = [];
    // find the timers of pagename
    for (var i = 0; i < timers.length; i++) {
        if (timers[i].PageName == pagename) {
            timersToUpdate.push(timers[i]);
        }
    }

    // remove timers, update them and reinsert them in struct
    for (var i = 0; i < timersToUpdate.length; i++) {
        var t = timersToUpdate[i];

        removeTimerFromStructById(t._id);

        // update activation time
        t.ActivationTime = t.ActivationTime + offsetDiff * 60 * 1000;
        t.OriginalActivationTime = t.OriginalActivationTime + offsetDiff * 60 * 1000;

        insertTimerInStruct(t);
    }
};


var anyTimers = function () {
    return timers.length != 0;
};
var CheckIfTimerActivation = function () {
    if (anyTimers()) {
        var now = Date.now();
        var NextTimer = getNextTimer();

        if (now > NextTimer.ActivationTime) {
            console.log("Timer activation registered");

            // remove the timer from timerstruct
            removeFrontTimerFromStruct();

            // Perform timer activation
            ActivateTimer(NextTimer);

            // check again to see if any new timers have activated this second
            CheckIfTimerActivation();
        }
    }
};

var ActivateTimer = function (timer) {
    if (timer.Type === "OneTime")
        ActivateOneTimeTimer(timer);
    else {
        ActivateWeeklyTimer(timer);
    }
};

var ActivateWeeklyTimer = function (timer) {
    console.log("Weekly timer activated:");
    console.log(timer);
    var EndContentSet = timer.EndContent.length > 1 || timer.EndContent[0] != "";
    var randomStartContent;

    if (!EndContentSet) {
        randomStartContent = randomlySelectContent(timer.StartContent);
        db.SaveContent(timer.PageName, randomStartContent, function () {
            io.PushTimerPackage(timer.PageName, randomStartContent);

            UpdateActivationTime(timer, true);
            insertTimerInStruct(timer);
        });
    } else {
        // if there is endcontent, update timer activation time and status
        if (timer.Active != true) {
            randomStartContent = randomlySelectContent(timer.StartContent);
            db.SetPageTimerActiveAndSaveContent(timer.PageName, timer._id, randomStartContent, function () {
                io.PushTimerPackage(timer.PageName, randomStartContent);

                timer.Active = true;
                timer.ActivationTime += timer.ActivationLength * 1000;

                insertTimerInStruct(timer);
            });
        } else {
            var randomEndContent = randomlySelectContent(timer.EndContent);
            db.SetPageTimerInactiveAndSaveContent(timer.PageName, timer._id, randomEndContent, function () {
                io.PushTimerPackage(timer.PageName, randomEndContent);

                timer.Active = false;

                UpdateActivationTime(timer, true);
                insertTimerInStruct(timer);
            });
        }
    }
};
var ActivateOneTimeTimer = function (timer) {
    console.log("Single timer activated:");
    console.log(timer);
    var EndContentSet = timer.EndContent.length > 1 || timer.EndContent[0] != "";
    var randomStartContent;

    // based on EndContentFlag, delete or set timer active, and push content update to user
    if (!EndContentSet) {
        randomStartContent = randomlySelectContent(timer.StartContent);
        db.DeletePageTimerAndSaveContent(timer.PageName, timer._id, randomStartContent, function () {
            io.PushTimerPackage(timer.PageName, randomStartContent);
        });
    } else {
        // if there is endcontent, update timer activation time and status
        if (timer.Active != true) {
            randomStartContent = randomlySelectContent(timer.StartContent);
            db.SetPageTimerActiveAndSaveContent(timer.PageName, timer._id, randomStartContent, function () {
                io.PushTimerPackage(timer.PageName, randomStartContent);

                timer.Active = true;
                timer.ActivationTime += timer.ActivationLength * 1000;

                insertTimerInStruct(timer);
            });
        } else {
            var randomEndContent = randomlySelectContent(timer.EndContent);
            db.DeletePageTimerAndSaveContent(timer.PageName, timer._id, randomEndContent, function () {
                io.PushTimerPackage(timer.PageName, randomEndContent);
            });
        }
    }
};

// should only be called on weekly timers
var UpdateActivationTime = exports.UpdateActivationTime = function (timer, saveToDb) {
    var today = new Date(Date.now()); // current date in utc
    var timerdate = new Date(timer.OriginalActivationTime);

    AlignDates(timerdate, today);

    // if timer Activation time is later today, and today is an activation day
    // then everything is fine. If not, find the next activation day from today
    // and add that to the timers date, in utc time
    // todo: the calculations should be done in the pages local time, the algorithm gets it wrong when utc is in another day than the local page time
    var todayWeekday = today.getDay() === 0 ? 6 : today.getDay() - 1;
    if (timer.ActivationDays[todayWeekday].Selected != true ||
        (timer.ActivationDays[todayWeekday].Selected == true &&
        today.getTime() > timerdate.getTime())) {

        timerdate.setDate(today.getDate() + FindDaysUntilNextActivation(timer));
    }

    console.log("Activation Time of timer with id " + timer._id + " is now: " + timerdate.toString());
    timer.ActivationTime = timerdate.getTime();

    if (saveToDb)
        db.UpdatePageTimerActivationTime(timer.PageName, timer._id, timer.ActivationTime);
};

var FindDaysUntilNextActivation = function (timer) {
    var today = new Date();
    var todayWeekday = today.getDay() === 0 ? 6 : today.getDay() - 1;

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
var AlignDates = function (date, today) {
    date.setDate(today.getDate());
    date.setMonth(today.getMonth());
    date.setFullYear(today.getFullYear());
};
var randomlySelectContent = function (contentarray) {
    // select one of the array items randomly
    var itemnr = randomIntInc(0, contentarray.length - 1);
    console.log("Item number " + itemnr + " randomly chosen");
    return contentarray[itemnr]; // todo: placeholder
};
var PrintInitTimerStructMessage = function () {
    console.log("*");
    console.log("----------------------------------------|");
    console.log("Starting Timer Structure Initialization |");
    console.log("----------------------------------------|");
    console.log("*");
};
var FindTimerIndexById = function (array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i]._id.toString() === id.toString()) // toString is needed to remove quotations from input
            return i;
    }
};
function randomIntInc (low, high) {
    // returns random number between low (inclusive) and high (inclusive)
    return Math.floor(Math.random() * (high - low + 1) + low);
}