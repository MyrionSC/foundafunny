/*
 * In here all the database communication logic for sdm resides
 */
var mongoose = require ("mongoose");
var pages = require ("./Pages.js");
var console = process.console; // for logs
var db = module.exports = {};

var uristring = 'mongodb://sdm-backend:sdm235813@ds043962.mongolab.com:43962/heroku_zkp49g4w';

// connect to mongolab
mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);

        InitPagesInRAM();
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
    Name: String,
    CurrentContent: String,
    ContentArray: Array,
    Favorites: Array,
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
db.SetContentFavorite = function (Name, content, callback) {
    sdmPage.findOne({'Name': Name}, function(err, page) {
        if (err) return console.log(err);

        for (var i = 0; i < page.ContentArray.length; i++) {
            var c = page.ContentArray[i];

            if (c.content === content) {
                c.favorite = true;
            }
        }
        page.markModified('ContentArray');

        page.save(function(err, obj) {
            if (err) {
                console.error("SetContentFavorite operation failed with error:");
                return console.error(err);
            }
            console.log("SetContentFavorite operation succeeded");
            callback();
        });
    });
};
db.SetContentUnFavorite = function (Name, content, callback) {
    sdmPage.findOne({'Name': Name}, function(err, page) {
        if (err) return console.log(err);

        for (var i = 0; i < page.ContentArray.length; i++) {
            var c = page.ContentArray[i];

            if (c.content === content) {
                c.favorite = false;
            }
        }
        page.markModified('ContentArray');

        page.save(function(err, obj) {
            if (err) {
                console.error("SetContentUnFavorite operation failed with error:");
                return console.error(err);
            }
            console.log("SetContentUnFavorite operation succeeded");
            callback();
        });
    });
};
db.SetPageTimerActiveAndSaveContent = function (Name, timerid, content, callback) {
    sdmPage.findOne({'Name': Name}, function(err, page) {
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
    sdmPage.findOne({'Name': Name}, function(err, page) {
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
    sdmPage.findOne({'Name': Name}, function(err, page) {
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
    sdmPage.findOne({'Name': Name}, function(err, page) {
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
    sdmPage.findOne({'Name': Name}, function(err, page) {
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
    //    { Name: Name },
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
    sdmPage.findOne({'Name': Name}, function(err, page) {
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
    sdmPage.findOne({ Name: Name }, { _id: 0, Timers: 0, ContentArray: { $slice: 1 } },
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
        { Name: Name },
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
    sdmPage.findOne({ Name: Name }, { ContentArray: { $slice: [skip, limit] },
        Name: 0, Timers: 0, Favorites: 0, Settings: 0, _id: 0 },  function(err, obj) {
        callback(err, obj);
    });
};
db.getTimers = function(Name, callback) {
    sdmPage.findOne({ Name: Name }, { Timers: { $slice: 10 }, // TODO: slice is hardcoded
        Name: 0, ContentArray: 0, Favorites: 0, Settings: 0, _id: 0 },  function(err, obj) {
        callback(err, obj);
    });
};
db.getAllTimers = function(callback) {
    sdmPage.find({}, { Name: 0, ContentArray: 0,
         Favorites: 0, Settings: 0 },  function(err, obj) {
        callback(err, obj);
    });
};

var InitPagesInRAM = function() {
    console.log("Starting init of pages in RAM");
    sdmPage.find({}, {},  function(err, dbpages) {
        if (err) {
            console.error("InitPagesInRAM operation failed with error object:");
            return console.error(err.message);
        }

        for (var i = 0; i < dbpages.length; i++) {
            var p = dbpages[i];

            // find one instance of each favorite in page
            for (var i = 0; i < p.ContentArray.length; i++) {
                var c = p.ContentArray[i];
                if (c.favorite === true && p.Favorites.indexOf(c.content) === -1) {
                    p.Favorites.push(c.content);
                }
            }

            pages.createPage(p);
        }

        console.log("Page init done. Number of pages loaded into ram: " + pages.getNumberOfPages());
        console.log("Pages names are:");
        for (var i = 0; i < pages.getNumberOfPages(); i++) {
            console.log(pages.pages[i].Name);
        }
        pages.initDone = true;
    });
};
var CreateContentPackage = db.CreateContentPackage = function(page, content) {
    var d = new Date(Date.now() + page.Settings.TimeDiff * 60000);
    var ramPage = pages.getPage(page.Name);

    return {
        content: content,
        date: ConstructReadableDateString(d),
        favorite: ramPage.ExistingFavorite(content)
    };
};
var ConstructReadableDateString = function (date) {
    var hours = date.getUTCHours().toString().length === 1 ? "0" + date.getUTCHours() : date.getUTCHours();
    var minutes = date.getUTCMinutes().toString().length === 1 ? "0" + date.getUTCMinutes() : date.getUTCMinutes();
    var seconds = date.getUTCSeconds().toString().length === 1 ? "0" + date.getUTCSeconds() : date.getUTCSeconds();
    return date.getUTCDate() + "/" + (date.getUTCMonth() + 1) + "/" + date.getUTCFullYear() + " "
        + hours + ":" + minutes + ":" + seconds;
};