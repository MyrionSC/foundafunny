var app = require("./app.js");
var io = require('socket.io')(app.server);
var timerStruct = require('./TimersStructure.js');
var db = require('./mongoDB.js');
var console = process.console; // for logs
var exports = {};

// ----------|
// Socket.IO |
// ----------|

var online = 0;
var tempName = "third"; // todo: hardcoded
var Pages = [];

io.sockets.on('connection', function (socket) {
    var Page = {};
    getOrInitPage(tempName, socket, function(page) {
        Page = page;
        online++;
        console.log("client connected to page " + Page.Name + ". Now online in page: " + Page.ConnectedSockets.length +
            ". Overall online: " + online );
    });

    // sends the PageObj info to new client on init
    db.GetInitPage(tempName, function(page) {
        console.log();
        console.log("sent init content to client:");
        console.log(page);
        socket.emit('pageinit', page);
    });

    // if a client pushes new content, update db and other clients
    socket.on('pushcontent', function (newcontent) {
        console.log();
        console.log("New content received: ");
        console.log(newcontent);

        // unshifts newcontent into ContentArray
        // todo: see if this takes too long
        db.SaveContent(tempName, newcontent, function(contentpackage) {
            NotifyClients(Page, socket, "contentupdate", contentpackage, false);
        });
    });

    // if a client pushes new timer, update db, add it to timerstructure and notify clients
    socket.on('savetimer', function (timer) {
        console.log();
        console.log("new timer received:");
        console.log(timer);

        if (timer.Type === "Weekly")
            timerStruct.UpdateActivationTime(timer, false);

        db.AddNewTimer(tempName, timer, function(newtimer) {
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
            //var NotifyClients = function (page, socket, updateType, updateObj, updateSender) {
            NotifyClients(Page, socket, "favoriteupdate", content, false);
        });
    });
    socket.on('unfavoritecontent', function (content) {
        console.log();
        console.log("Unfavorite request received on content " + content + " from page " + Page.Name);

        // change all instances of content in db to unfavorite, notify other clients in callback
        db.SetContentUnFavorite(Page.Name, content, function() {
            //var NotifyClients = function (page, socket, updateType, updateObj, updateSender) {
            NotifyClients(Page, socket, "unfavoriteupdate", content, false);
        });
    });

    socket.on('disconnect', function () {
        online--;
        Page.ConnectedSockets.splice(Page.ConnectedSockets.indexOf(socket), 1);
        console.log("Client disconnected from page " + Page.Name + ". Now online in page: " + Page.ConnectedSockets.length +
        ". Overall online: " + online);
    });
});

exports.db = db;
// used by timerstructure to update clients on timerfire
exports.PushTimerPackage = function(pagename, content) {
    var page = getPage(pagename);

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

var getOrInitPage = function(name, socket, callback) {
    var page = nameSearch(name, Pages);

    if (page != undefined) {
        page.ConnectedSockets.push(socket);
        console.log("Returning existing page for client: " + name);
        callback(page);
        return;
    }

    console.log("making new page for client: " + name);
    db.GetInitPage(name, function(dbpage) {
        page = new PageObj(name, dbpage.Settings);
        console.log("New page filled with db data and returned:");
        console.log(page);
        page.ConnectedSockets.push(socket);
        Pages.push(page);
        callback(page);
    });
};
var getPage = function(name) {
    return nameSearch(name, Pages);
};
function nameSearch(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].Name === nameKey) {
            return myArray[i];
        }
    }
}
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

var PageObj = function(Name, Settings) {
    this.Name = Name;
    this.Settings = new SettingsObj(Settings);
    this.ConnectedSockets = [];
};
var SettingsObj = function(settings) {
    this.bg_color = settings.bg_color;
    this.Timezone = settings.Timezone;
    this.TimeDiff = settings.TimeDiff;
};

// perform handshake with timersstructure
timerStruct.SocketHandshake(exports);