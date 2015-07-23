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
        if (err) return console.error(err);
        console.log();
        console.log("sent init content to client:");
        console.log(page);
        socket.emit('pageinit', page);
    });

    // if a client pushes new content, update db and other clients
    socket.on('pushcontent', function (newcontent) {
        console.log("New content received: " + newcontent);

        // unshifts newcontent into ContentArray
        db.SaveContent(tempName, newcontent);

        // notify other clients
        for (var i = 0; i < Page.ConnectedSockets.length; i++) {
            var s = Page.ConnectedSockets[i];
            if (s != socket) {
                s.emit('contentupdate', {'CurrentContent': newcontent});
                console.log("another client notified: " + i);
            }
        }
    });

    // if a client pushes new timer, update db and and add it to timerstructure
    socket.on('savetimer', function (timer) {

        if (timer.Type === "Weekly")
            timerStruct.UpdateActivationTime(timer, false);

        timer.id = db.AddNewTimer(tempName, timer);

        timerStruct.insertTimerInStruct(timer);

        console.log("new timer received:");
        console.log(timer);
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
    for (var i = 0; i < page.ConnectedSockets.length; i++) {
        var s = page.ConnectedSockets[i];
        s.emit('timerfire', timerpackage);
    }
    console.log("Content pushed to users: " + content);
    console.log("users notified of timer update: " + page.ConnectedSockets.length);
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

var Page = function(name) {
    this.Name = name;
    this.ConnectedSockets = [];
};

// perform handshake with timersstructure
timerStruct.SocketHandshake(exports);