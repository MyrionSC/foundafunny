/*
 * In here all the database communication logic for sdm resides
 */
var mongoose = require ("mongoose");
var console = process.console; // for logs
var db = module.exports = {};

var uristring = 'mongodb://sdm-backend:sdm235813@ds043962.mongolab.com:43962/heroku_zkp49g4w';

// connect to mongolab
mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

// model
var timerSchema = new mongoose.Schema({
    Name: String,
    PageName: String,
    StartContent: String,
    Type: String,
    ActivationDays: Array,
    ActivationDaysReadable: String,
    ActivationTime: Number,
    ActivationTimeReadable: String,
    ActivationLength: Number,
    EndContent: String,
    Active: Boolean
});
var sdmSchema = new mongoose.Schema({
    name: String,
    CurrentContent: String,
    ContentArray: Array,
    Settings: { // TODO: add some youtube settings and such later
        bg_color: String,
        Timezone: String,
        TimeDiff: Number // difference from localtime to utc in minutes
    },
    Timers: [timerSchema]
});
var sdmPage = mongoose.model("sdmpage", sdmSchema);
var sdmTimer = mongoose.model("sdmtimer", timerSchema);


// db methods
db.SetPageTimerActiveAndSaveContent = function (Name, timerid, content, callback) {
    sdmPage.findOne({'name': Name}, function(err, page) {
        if (err) return console.log(err);

        var timer = page.Timers.id(timerid);
        var contentpackage = CreateContentPackage(page, content);

        page.ContentArray.unshift(contentpackage);
        timer.Active = true;

        page.save(function(err, obj) {
            if (err) {
                console.error("SetPageTimerActiveAndSaveContent operation failed with error:");
                return console.error(err);
            }
            console.log("timer with id set to active: " + timer._id + ", and content saved:");
            console.log(contentpackage);
            callback();
        });
    });
};
db.SetPageTimerInactiveAndSaveContent = function (Name, timerid, content, callback) {
    sdmPage.findOne({'name': Name}, function(err, page) {
        if (err) return console.log(err);

        var timer = page.Timers.id(timerid);
        var contentpackage = CreateContentPackage(page, content);

        page.ContentArray.unshift(contentpackage);
        timer.Active = false;

        page.save(function(err, obj) {
            if (err) {
                console.error("SetPageTimerInactiveAndSaveContent operation failed with error:");
                return console.error(err);
            }
            console.log("timer with id set to inactive: " + timer._id + ", and content saved:");
            console.log(contentpackage);
            callback();
        });
    });
};
db.DeletePageTimerAndSaveContent = function (Name, timerid, content, callback) {
    // todo: see if timer id can be used instead
    sdmPage.findOne({'name': Name}, function(err, page) {
        if (err) return console.error(err);

        var contentpackage = CreateContentPackage(page, content);
        page.Timers.id(timerid).remove();
        page.ContentArray.unshift(contentpackage);

        page.save(function(err, obj) {
            if (err) {
                console.error("DeletePageTimerAndSaveContent operation failed with error:");
                return console.error(err);
            }
            console.log("timer with id deleted from db: " + timerid + ", and content saved:");
            console.log(contentpackage);
            callback();
        });
    });
};
db.DeletePageTimer = function (Name, timerid, callback) {
    console.log("Trying to remove timer with id " + timerid + " from " +
        "page: " + Name);
    sdmPage.findOne({'name': Name}, function(err, page) {
        if (err) return console.error(err);

        page.Timers.id(timerid).remove();

        page.save(function(err, obj) {
            if (err) {
                console.error("DeletePageTimer operation failed with error:");
                return console.error(err);
            }
            console.log("timer with id deleted from db: " + timerid);
            callback();
        });
    });
};
db.UpdatePageTimerActivationTime = function (Name, timerid, actitime) {
    sdmPage.findOne({'name': Name}, function(err, page) {
        if (err) return console.log(err);

        var timer = page.Timers.id(timerid);

        timer.ActivationTime = actitime;

        page.save(function(err, obj) {
            if (err) {
                console.error("UpdatePageTimerActivation operation failed with error:");
                return console.error(err);
            }
            console.log("timer with id's activation time updated: " + timer._id);
        });
    });
};
db.SaveContent = function (Name, content, callback) {
    //sdmPage.update(
    //    { name: Name },
    //    {
    //        $push: {
    //            'ContentArray': { $each: [content], $position: 0 } } // unshift
    //    }, function(err, obj) {
    //        if (err) {
    //            console.error("SaveContent failed with error:");
    //            return console.error(err);
    //        }
    //        console.log("Content save to db:");
    //        console.log(content);
    //        callback();
    //    }
    //);
    sdmPage.findOne({'name': Name}, function(err, page) {
        if (err) return console.error(err);

        var contentpackage = CreateContentPackage(page, content);

        page.ContentArray.unshift(contentpackage);

        page.save(function(err, obj) {
            if (err) {
                console.error("SaveContent failed with error:");
                return console.error(err);
            }
            console.log("Content saved to db:");
            console.log(contentpackage);
            callback(contentpackage);
        });
    });
};
db.GetInitPage = function(Name, callback) {
    sdmPage.findOne({ name: Name }, { ContentArray: { $slice: 1 }
            , _id: 0, Timers: 0},
        function(err, page) {
            if (err) {
                console.error("GetInitPage operation failed with error:");
                return console.error(err);
            }
            callback(page);
        });
};
db.AddNewTimer = function(Name, timer, callback) {
    var newtimer = new sdmTimer({
        PageName: timer.PageName,
        Name: timer.Name,
        StartContent: timer.StartContent,
        Type: timer.Type,
        ActivationDays: timer.ActivationDays,
        ActivationDaysReadable: timer.ActivationDaysReadable,
        ActivationTime: timer.ActivationTime,
        ActivationTimeReadable: timer.ActivationTimeReadable,
        ActivationLength: timer.ActivationLength,
        EndContent: timer.EndContent,
        Active: timer.Active
    });

    sdmPage.update(
        { name: Name },
        {
            $push: { 'Timers': newtimer }
        }, function(err, obj) {
            if (err) {
                console.log("AddNewTimer operation failed");
                console.log("Error object:");
                return console.error(err);
            }
            callback(newtimer);
        }
    );
};
db.getHistory = function(Name, skip, limit, callback) {
    sdmPage.findOne({ name: Name }, { ContentArray: { $slice: [skip, limit] }, // TODO: name is hardcoded
        name: 0, Timers: 0, Favorites: 0, Settings: 0, _id: 0 },  function(err, obj) {
        callback(err, obj);
    });
};
db.getTimers = function(Name, callback) {
    sdmPage.findOne({ name: Name }, { Timers: { $slice: 10 }, // TODO: name and slice is hardcoded
        name: 0, ContentArray: 0, Favorites: 0, Settings: 0, _id: 0 },  function(err, obj) {
        callback(err, obj);
    });
};
db.getAllTimers = function(callback) {
    sdmPage.find({}, { name: 0, ContentArray: 0, // TODO: name is hardcoded
         Favorites: 0, Settings: 0 },  function(err, obj) {
        callback(err, obj);
    });
};

var CreateContentPackage = db.CreateContentPackage = function(page, content) {
    var d = new Date(Date.now() + page.Settings.TimeDiff * 60000);
    return {
        content: content,
        date: ConstructReadableDateString(d),
        favorite: ExistingFavorite(content)
    };
};
var ConstructReadableDateString = function (date) {
    var hours = date.getUTCHours().toString().length === 1 ? "0" + date.getUTCHours() : date.getUTCHours();
    var minutes = date.getUTCMinutes().toString().length === 1 ? "0" + date.getUTCMinutes() : date.getUTCMinutes();
    var seconds = date.getUTCSeconds().toString().length === 1 ? "0" + date.getUTCSeconds() : date.getUTCSeconds();
    return date.getUTCDate() + "/" + date.getUTCMonth() + "/" + date.getUTCFullYear() + " "
        + hours + ":" + minutes + ":" + seconds;
};
var ExistingFavorite = function(content) {
    // todo: search local favorite list for match
    return false;
};