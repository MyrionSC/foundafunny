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
    online++;
    console.log("client connected. Now online: " + online);
    var Page = getOrInitPage(tempName);
    Page.ConnectedSockets.push(socket);

    // sends the Page info to new client on init
    db.GetInitPage(tempName, function(err, page) {
        if (err) {
            console.error("GetInitPage operation failed with error:");
            return console.error(err);
        }
        console.log();
        console.log("sent init content to client:");
        console.log(page);
        socket.emit('pageinit', page);
    });

    // if a client pushes new content, update db and other clients
    socket.on('pushcontent', function (newcontent) {
        console.log("New content received: " + newcontent);

        // unshifts newcontent into ContentArray
        db.SaveContent(tempName, newcontent, function() {
            NotifyClients(Page, socket, "contentupdate", {
                content: newcontent
            }, false);
        });
    });

    // if a client pushes new timer, update db, add it to timerstructure and notify clients
    socket.on('savetimer', function (timer) {
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

    socket.on('disconnect', function () {
        online--;
        Page.ConnectedSockets.splice(Page.ConnectedSockets.indexOf(socket), 1);
        console.log("Client disconnected. Now online: " + online);
    });
});

exports.db = db;
// used by timerstructure to update clients on timerfire
exports.PushTimerPackage = function(pagename, content) {
    // create a package for the users <3
    var timerpackage = {
        'content': content
        // at some time, more should be added
    };
    // emit content to connected page sockets
    var page = getPage(pagename);
    if (page === undefined || page.ConnectedSockets.length === 0) {
        console.log("No users are connected to receive timer package. Where is everyone? :(");
    }
    else {
        for (var i = 0; i < page.ConnectedSockets.length; i++) {
            var s = page.ConnectedSockets[i];
            s.emit('timerfire', timerpackage);
        }
        console.log("Content pushed to users: " + content);
        console.log("users notified of timer update: " + page.ConnectedSockets.length);
    }
};

var getOrInitPage = function(name) {
    var page = search(name, Pages);

    if (page != undefined) {
        console.log("Returning existing page for client: " + name);
        return page;
    }

    console.log("making new page for client: " + name);
    page = new Page(name);
    Pages.push(page);
    return page;
};
var getPage = function(name) {
    return search(name, Pages);
};
function search(nameKey, myArray){
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
        console.log(page.ConnectedSockets.length + " client(s) " + page.Name + " notified of " + updateType + "update");
    }
    else {
        for (var i = 0; i < page.ConnectedSockets.length; i++) {
            if (page.ConnectedSockets[i] != socket) {
                page.ConnectedSockets[i].emit(updateType, updateObj);
            }
            var j = page.ConnectedSockets.length - 1;
            console.log(j + " client(s) in page " + page.Name + " notified of " + updateType + "update");
        }
    }
};

var Page = function(name) {
    this.Name = name;
    this.ConnectedSockets = [];
};

// perform handshake with timersstructure
timerStruct.SocketHandshake(exports);