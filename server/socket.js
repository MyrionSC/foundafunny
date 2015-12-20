var app = require("./../app.js");
var io = require('socket.io')(app.server);
var timerStruct = require('./TimersStructure.js');
var db = require('./mongoDB.js');
var pages = require('./Pages.js');
var console = process.console; // for logs
var exports = {};

// ----------|
// Socket.IO |
// ----------|

var online = 0;
var tempName = "third"; // todo: hardcoded

io.sockets.on('connection', function (socket) {
    var Page = {};

    // the first thing the client sends when connecting
    socket.on('handshake', function (pagename) {
        clientInit(pagename);
    });
    // if a client pushes new content, update db and other clients
    socket.on('pushcontent', function (newcontent) {
        console.log();
        console.log("New content received: ");
        console.log(newcontent);

        // unshifts newcontent into ContentArray
        // todo: see if this takes too long
        db.SaveContent(Page.Name, newcontent, function(contentpackage) {
            NotifyClients(Page, socket, "contentupdate", contentpackage, false);
        });
    });
    // if a client pushes new timer, update db, add it to timerstructure and notify clients
    socket.on('savetimer', function (timer) {
        console.log();
        console.log("new timer from page " + Page.Name + " received:");
        console.log(timer);

        if (timer.Type === "Weekly")
            timerStruct.UpdateActivationTime(timer, false);

        db.AddNewTimer(Page.Name, timer, function(newtimer) {
            console.log("Timer with id inserted into db: " + newtimer._id);
            timerStruct.insertTimerInStruct(newtimer);
            NotifyClients(Page, socket, "timerupdate", {}, false);
        });
    });
    // if a client pushes a timer delete, update db and delete it from timerstructure
    socket.on('deletetimer', function (timer) {
        console.log();
        console.log("Timer deletion requested from page: " + timer.PageName);
        console.log(timer);

        // delete timer in db and timerstructure, and push timer deletion to clients when done
        db.DeletePageTimer(timer.PageName, timer._id, function() {
            if (timerStruct.removeTimerFromStructById(timer._id) != -1) {
                // if timerstruct remove succesfull, notify other clients
                NotifyClients(Page, socket, "timerupdate", {}, false);
            }
        });
    });
    socket.on('favoritecontent', function (content) {
        console.log();
        console.log("Favorite request received on content " + content + " from page " + Page.Name);

        // change all instances of content in db to favorite, notify other clients in callback
        db.SetContentFavorite(Page.Name, content, function() {
            Page.insertFavorite(content);

            //var NotifyClients = function (page, socket, updateType, updateObj, updateSender) {
            NotifyClients(Page, socket, "favoriteupdate", content, false);
        });
    });
    socket.on('unfavoritecontent', function (content) {
        console.log();
        console.log("Unfavorite request received on content " + content + " from page " + Page.Name);

        // change all instances of content in db to unfavorite, notify other clients in callback
        db.SetContentUnFavorite(Page.Name, content, function() {
            Page.removeFavorite(content);

            //var NotifyClients = function (page, socket, updateType, updateObj, updateSender) {
            NotifyClients(Page, socket, "unfavoriteupdate", content, false);
        });
    });
    socket.on('savesettings', function(settings) {
        console.log();
        console.log("Save Settings request received from page " + Page.Name);

        var offsetDiff = findDifference(Page.Settings.offset, settings.offset);

        db.UpdatePageSettings(Page.Name, settings, offsetDiff, function() {
            Page.updateSettings(settings);

            // update timers in timerstruct if new timezone
            timerStruct.updateTimersTimezone(Page.Name, settings, offsetDiff);

            NotifyClients(Page, socket, "settingsupdate", settings, false);
        });
    });

    socket.on('disconnect', function () {
        online--;
        Page.ConnectedSockets.splice(Page.ConnectedSockets.indexOf(socket), 1);
        console.log("Client disconnected from page " + Page.Name + ". Now online in page: " + Page.ConnectedSockets.length +
        ". Overall online: " + online);
    });

    var clientInit = function(pagename) {
        if (pages.initDone) {
            Page = pages.getPage(pagename);
            Page.ConnectedSockets.push(socket);
            online++;
            console.log("client connected to page " + Page.Name + ". Now online in page: " + Page.ConnectedSockets.length +
                ". Overall online: " + online );

            // sends the PageObj info to new client on init
            // we don't have to check if it exists, it was done before this
            db.GetInitPage(pagename, function(page) {
                page.Favorites = Page.Favorites;

                console.log();
                console.log("sent init content to client:");
                console.log(page);
                socket.emit('pageinit', page);
            });
        }
        else {
            // wait 50 seconds for db call to get through and try again
            setTimeout(function() {
                clientInit(pagename);
            }, 50);
        }
    };
});

exports.db = db;
// used by timerstructure to update clients on timerfire
exports.PushTimerPackage = function(pagename, content) {
    var page = pages.getPage(pagename);

    // emit content to connected page sockets
    if (page === undefined || page.ConnectedSockets.length === 0) {
        console.log("No users are connected to receive timer package. Where is everyone? :(");
    }
    else {
        var contentpackage = db.CreateContentPackage(page, content);

        for (var i = 0; i < page.ConnectedSockets.length; i++) {
            var s = page.ConnectedSockets[i];
            s.emit('timerfire', contentpackage);
        }
        console.log("Content pushed to users: " + content);
        console.log("users notified of timer update: " + page.ConnectedSockets.length);
    }
};

var NotifyClients = function (page, socket, updateType, updateObj, updateSender) {
    if (updateSender) {
        for (var i = 0; i < page.ConnectedSockets.length; i++) {
            page.ConnectedSockets[i].emit(updateType, updateObj);
        }
        console.log(page.ConnectedSockets.length + " client(s) " + page.Name + " notified of " + updateType);
    }
    else {
        for (var i = 0; i < page.ConnectedSockets.length; i++) {
            if (page.ConnectedSockets[i] != socket) {
                page.ConnectedSockets[i].emit(updateType, updateObj);
            }
        }
        var j = page.ConnectedSockets.length - 1;
        console.log(j + " client(s) in page " + page.Name + " notified of " + updateType);
    }
};
// find difference between difference from older to newer
var findDifference = function(older, newer) {
    var diff = 0;
    if (older <= 0 && newer <= 0) {
        diff = Math.abs(older - newer);
    } else if (older <= 0 && newer >= 0) {
        diff = older * -1 + newer;
    } else if (older >= 0 && newer <= 0) {
        diff = newer * -1 + older;
    } else { // original >= 0 && newer >= 0
        diff = Math.abs(older * -1 - newer * -1);
    }

    if (older > newer) {
        return diff * -1;
    }
    return diff;
};

// perform handshake with timersstructure
timerStruct.SocketHandshake(exports);