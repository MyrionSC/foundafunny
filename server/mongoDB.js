/*
 * In here all the database communication logic for sdm resides
 */
var mongoose = require ("mongoose");
var model = require ("./dbModel");
var pages = require ("./Pages.js");
var os = require('os');
// var console = process.console; // for logs
var db = module.exports = {};

var uristring;
if (os.hostname() === "marand-nuc") {
    uristring = "mongodb://localhost:27018/foundafunny";
} else {
    uristring = "mongodb://localhost:27017/foundafunny";
}

// connect to mongolab
var dbConnect = function () {
	mongoose.connect(uristring, function (err, res) {
	    if (err) {
		console.log ('ERROR connecting to: ' + uristring);
		console.log (err);
		console.log('trying again in two seconds');
		setTimeout(function() {
			dbConnect();
		}, 2000);
	    } else {
		console.log ('Succeeded connected to: ' + uristring);

		InitPagesInRAM();
	    }
	});
}
dbConnect();

// model
var FaFPage = mongoose.model("fafpage", model.pageSchema);
var FaFTimer = mongoose.model("faftimer", model.timerSchema);

// db methods
db.SetContentFavorite = function (Name, content, callback) {
    FaFPage.findOne({'Name': Name}, function(err, page) {
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
    FaFPage.findOne({'Name': Name}, function(err, page) {
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
    FaFPage.findOne({'Name': Name}, function(err, page) {
        if (err) return console.log(err);

        var timer = page.Timers.id(timerid);
        var contentpackage = CreateContentPackage(page, content);

        page.ContentArray.unshift(contentpackage);
        timer.Active = true;
        timer.ActivationTime += timer.ActivationLength * 1000;

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
    FaFPage.findOne({'Name': Name}, function(err, page) {
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
    FaFPage.findOne({'Name': Name}, function(err, page) {
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
    FaFPage.findOne({'Name': Name}, function(err, page) {
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
    FaFPage.findOne({'Name': Name}, function(err, page) {
        if (err) return console.log(err);

        try {
            var timer = page.Timers.id(timerid);
            timer.ActivationTime = actitime;
        } catch (err) {
            console.log(err);
            return;
        }
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
    FaFPage.findOne({'Name': Name}, function(err, page) {
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
    FaFPage.findOne({ Name: Name }, { _id: 0, Timers: 0, ContentArray: { $slice: 1 } },
        function(err, page) {
            if (err) {
                console.error("GetInitPage operation failed with error:");
                return console.error(err);
            }
            callback(page);
        }
    );
};
db.AddNewTimer = function(Name, timer, callback) {
    var newtimer = new FaFTimer({
        PageName: timer.PageName,
        Name: timer.Name,
        StartContent: timer.StartContent,
        Type: timer.Type,
        ActivationDays: timer.ActivationDays,
        ActivationDaysReadable: timer.ActivationDaysReadable,
        ActivationTime: timer.ActivationTime,
        OriginalActivationTime: timer.OriginalActivationTime,
        ActivationTimeReadable: timer.ActivationTimeReadable,
        ActivationLength: timer.ActivationLength,
        EndContent: timer.EndContent,
        Active: timer.Active
    });

    FaFPage.update(
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
db.UpdateTimer = function(Name, timer, callback) {
    FaFPage.findOne({'Name': Name}, function(err, page) {
        if (err) return console.log(err);

        var dbtimer = page.Timers.id(timer._id);
        if (dbtimer === null) {
            console.log("Timer with id: " + timer._id + " not found in database");
            return;
        }
        model.updateTimer(dbtimer, timer);

        page.save(function(err, obj) {
            if (err) {
                console.error("UpdateTimer operation failed with error:");
                return console.error(err);
            }
            callback(timer);
        });
    });
};
db.UpdatePageSettings = function (Name, settings, offsetDiff, callback) {
    FaFPage.findOne({'Name': Name}, function(err, page) {
        if (err) return console.log(err);

        page.Settings = settings;

        // update timers activation time
        for (var i = 0; i < page.Timers.length; i++) {
            var t = page.Timers[i];

            t.ActivationTime = t.ActivationTime + offsetDiff * 60 * 1000;
            t.OriginalActivationTime = t.OriginalActivationTime + offsetDiff * 60 * 1000;
        }

        page.save(function(err, obj) {
            if (err) {
                console.error("UpdatePageSettings operation failed with error:");
                return console.error(err);
            }
            callback();
        });
    });
};

db.CreateNewPage = function(newPagePackage, callback) {
    var newPage = new FaFPage({
        Name: newPagePackage.pagename
    });
    model.setSettings(newPage.Settings, newPagePackage);

    // add the first content
    var d = new Date(Date.now() + newPagePackage.offset * 60000);
    var firstContent = {
        content: "Hello World",
        date: ConstructReadableDateString(d),
        favorite: false
    };
    newPage.ContentArray.push(firstContent);

    newPage.save(function (err) {
        if (err) {
            console.error("CreateNewPage operation failed with error obj:");
            return console.error(err);
        }
        // saved!
        callback();
    });
};


db.getHistory = function(Name, skip, limit, callback) {
    FaFPage.findOne({ Name: Name }, { ContentArray: { $slice: [skip, limit] },
        Name: 0, Timers: 0, Favorites: 0, Settings: 0, _id: 0 },  function(err, obj) {
        callback(err, obj);
    });
};
db.getTimers = function(Name, callback) {
    FaFPage.findOne({ Name: Name }, { Timers: { $slice: 10 }, // TODO: slice is hardcoded
        Name: 0, ContentArray: 0, Favorites: 0, Settings: 0, _id: 0 },  function(err, obj) {
        callback(err, obj);
    });
};
db.getAllTimers = function(callback) {
    FaFPage.find({}, { ContentArray: 0, Favorites: 0, Settings: 0 },  function(err, obj) {
        callback(err, obj);
    });
};

var InitPagesInRAM = function() {
    PrintRAMInitMsg();
    FaFPage.find({}, {},  function(err, dbpages) {
        if (err) {
            console.error("InitPagesInRAM operation failed with error object:");
            return console.error(err.message);
        }

        console.log("Numer of Pages found in db: " + dbpages.length);
        for (var i = 0; i < dbpages.length; i++) {
            var p = dbpages[i];
            // find one instance of each favorite in page
            for (var j = 0, len = p.ContentArray.length; j < len; j++) {
                var c = p.ContentArray[j];
                if (c.favorite === true && p.Favorites.indexOf(c.content) === -1) {
                    p.Favorites.push(c.content);
                }
            }
            pages.createPage(p);
        }

        console.log("Page init done. Number of pages loaded into ram: " + pages.getNumberOfPages());
        console.log("Pages names are:");
        for (var i = 0; i < dbpages.length; i++) {
            console.log("- " + pages.pages[i].Name);
        }
        pages.initDone = true;
    });
};
var CreateContentPackage = db.CreateContentPackage = function(page, content) {
    var d = new Date(Date.now() + page.Settings.offset * 60000);
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
var PrintRAMInitMsg = function() {
    console.log("*");
    console.log("---------------------------------|");
    console.log("Starting RAM Page Initialization |");
    console.log("---------------------------------|");
    console.log("*");
};
function findById(source, id) {
    for (var i = 0; i < source.length; i++) {
        if (source[i]._id === id) {
            return i;
        }
    }
    throw "Couldn't find object with id: " + id;
}
