// generate new sdm instance
//var initMongoDB = function (Name) {
//    var newmongo = new sdmPage({
//        name: Name,
//        Settings: {
//            bg_color: "#ffffff",
//            Timezone: "GMT+0200 (CEST)",
//            TimeDiff: 120
//        }
//    });
//    newmongo.save(function (err) {if (err) console.log('Error on save of db: ' + Name)});
//};
//initMongoDB("third");


// timer functions
//var StartOneTimeTimer = function(timer) {
//    // find difference between timer and page date in milliseconds
//    var diff = timer.ActivationTime - Date.now();
//    console.log("Milliseconds until activation: " + diff);
//
//    // Start setTimeout
//    timer.TimeoutVar = setTimeout(function() {
//        ActivateOneTimeTimer(timer);
//    }, diff);
//};
//
//var StartWeeklyTimer = function(timer) {
//    // find milliseconds to first activation
//    var today = new Date(Date.now()); // current date in utc
//    console.log(today);
//    //console.log(timer.ActivationTime);
//    var timerdate = new Date(timer.ActivationTime);
//    // as date, month and year isn't specified from the client site, it is done here
//    AlignDates(timerdate, today);
//    console.log(timerdate);
//    var diff = 0;
//
//    if (today.getTime() < timerdate.getTime()) {
//        console.log("Today number (mon = 0):");
//        console.log(today.getDay() - 1);
//        console.log("Activation Day:");
//        console.log(timer.ActivationDays[today.getDay() - 1].Day);
//        console.log("Selected:");
//        console.log(timer.ActivationDays[today.getDay() - 1].Selected);
//
//        if (timer.ActivationDays[today.getDay() - 1].Selected === true) {
//            //console.log("1");
//            diff = timerdate.getTime() - today.getTime();
//            StartNextWeeklyTimer(timer, diff);
//        }
//        else {
//            //console.log("2");
//            diff = timerdate.getTime() - today.getTime() + FindDaysUntilNextActivation(timer) * dayInMilliSecCONST;
//            StartNextWeeklyTimer(timer, diff);
//        }
//    }
//    else {
//        // current time is more than timer activation time, so look for next activation day
//        //console.log("3");
//        diff =  -(today.getTime() - timerdate.getTime()) + FindDaysUntilNextActivation(timer) * dayInMilliSecCONST;
//        StartNextWeeklyTimer(timer, diff);
//    }
//};
//
//var StartNextWeeklyTimer = function (timer, diff) {
//    console.log("Next weekly timer activating in " + diff + " milliseconds");
//
//    // Start setTimeout
//    timer.TimeoutVar = setTimeout(function() {
//        // Activate first timer
//        ActivateWeeklyTimer(timer);
//
//        // calculate time for next timer
//        var today = new Date(Date.now());
//        var newActivationDate = new Date(timer.ActivationTime);
//        AlignDates(newActivationDate, today);
//        newActivationDate.setDate(today.getDate() + FindDaysUntilNextActivation(timer));
//        var newdiff = newActivationDate.getTime() - today.getTime();
//
//        // Start next timer
//        StartNextWeeklyTimer(timer, newdiff);
//    }, diff);
//};
//
//var ActivateOneTimeTimer = function(timer) {
//    console.log("Single timer activated!");
//    var EndContentFlag = timer.EndContent != "";
//
//    // based on EndContentFlag, delete or set timer active
//    if (EndContentFlag)
//        db.SetPageTimerActiveAndSaveContent(tempName, timer, timer.StartContent);
//    else
//        db.DeletePageTimerAndSaveContent(tempName, timer, timer.StartContent);
//
//    // push content to user
//    PushTimerPackage(content);
//
//    // if there is endcontent, start a new timer of Activation Length
//    if (EndContentFlag) {
//        console.log("End content timer startet:");
//        console.log("Activation in: " + timer.ActivationLength + " seconds\n");
//        // start new timer for endcontent
//        timer.TimeoutVar = setTimeout(function () {
//            db.DeletePageTimerAndSaveContent(tempName, timer, timer.EndContent);
//
//            // push content to user
//            PushTimerPackage(content);
//        }, timer.ActivationLength * 1000);
//    }
//};
//
//var ActivateWeeklyTimer = function(timer) {
//    console.log("Weekly timer activated!");
//    var EndContentFlag = timer.EndContent != "";
//
//    if (EndContentFlag)
//        db.SetPageTimerActiveAndSaveContent(tempName, timer, timer.StartContent);
//    else
//        db.SaveContent(tempName, timer.StartContent);
//
//    // push content to user
//    PushTimerPackage(timer.StartContent);
//
//    // if there is endcontent, start a new timer of Activation Length
//    if (EndContentFlag) {
//        console.log("End content timer startet:");
//        console.log("Activation in: " + timer.ActivationLength + " seconds\n");
//        // start new timer for endcontent
//        timer.TimeoutVar = setTimeout(function () {
//            db.SetPageTimerInactiveAndSaveContent(tempName, timer, timer.EndContent);
//
//            // push content to user
//            PushTimerPackage(content);
//        }, timer.ActivationLength * 1000);
//    }
//};

//var PushTimerPackage = function(content) {
//    // create a package for the users <3
//    var timerpackage = {
//        'content': content
//        // at some time, more should be added
//    };
//    // emit content to users
//    for (var i = 0; i < connectedSockets.length; i++) {
//        var s = connectedSockets[i];
//        s.emit('timerfire', timerpackage);
//    }
//    console.log("Content pushed to users: " + content);
//    console.log("users notified of timer update: " + connectedSockets.length);
//};

//var ThrowTimerCouldNotBeLocatedInArrayERROR = function(timer) {
//    console.error("Timer could not be located in array:");
//    console.error(timer);
//};
//
//// returns timers index in page array of timers
//var timerIndex = function (page, timer) {
//    var res = -1;
//    for (var i = 0; i < page.Timers.length; i++) {
//        var t = page.Timers[i];
//        // this comparison might not be sufficient at some point
//        if (t.StartContent === timer.StartContent && t.ActivationTime === timer.ActivationTime) {
//            res = i;
//            console.log("Timer located in page array at index: " + i);
//            break;
//        }
//    }
//    return res;
//};
//
//var FindDaysUntilNextActivation = function (timer) {
//    var today = new Date();
//    var todayWeekday = today.getDay() - 1;
//
//    var res = 1;
//    for (var i = 0; i < timer.ActivationDays.length; i++) {
//        var index = ((todayWeekday + 1 + i) % 7);
//        var obj = timer.ActivationDays[index];
//
//        if (obj.Selected === true) {
//            console.log("Next Activation time in " + res + " days");
//            return res;
//        }
//        // else
//        res++;
//    }
//};
//var AlignDates = function(date, today) {
//    date.setDate(today.getDate());
//    date.setMonth(today.getMonth());
//    date.setFullYear(today.getFullYear());
//};

// returns timers index in page array of timers
//var timerIndex = function (page, timer) {
//    var res = -1;
//    for (var i = 0; i < page.Timers.length; i++) {
//        var t = page.Timers[i];
//        // this comparison might not be sufficient at some point
//        if (t.StartContent === timer.StartContent && t.ActivationTime === timer.ActivationTime) {
//            res = i;
//            console.log("Timer located in page array at index: " + i);
//            break;
//        }
//    }
//    return res;
//};

//var ThrowTimerCouldNotBeLocatedInArrayERROR = function(timer) {
//    console.error("Timer could not be located in array:");
//    console.error(timer);
//};