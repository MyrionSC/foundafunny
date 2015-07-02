var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose = require ("mongoose");
var scribe = require('scribe-js')(); // for logging
var console = process.console; // for logging

app.set('port', (process.env.PORT || 5000));

app.all('*',function(req,res,next)
{
    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin','*'); // allows everyone to send requests. Should be switched with single ip later
    res.set('Access-Control-Allow-Methods','GET,POST');
    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
    res.set('Access-Control-Allow-Credentials','true');

    if ('OPTIONS' == req.method) return res.status(200).end();

    next();
});

// --------|
// MongoDB |
// --------|

var uristring = 'mongodb://sdm-backend:sdm235813@ds043962.mongolab.com:43962/heroku_zkp49g4w';

// connect to mongolab
mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

// create sdm page schema
var sdmSchema = new mongoose.Schema({
    name: String,
    CurrentContent: String,
    ContentArray: Array,
    Favorites: Array,
    Settings: { // TODO: add some youtube settings and such later
        bg_color: String,
        Timezone: String,
        TimeDiff: Number // difference from localtime to utc in minutes
    },
    Timers: Array
});
var sdmPage = mongoose.model("sdmpage", sdmSchema);


// ----------|
// Socket.IO |
// ----------|

var online = 0;
var connectedSockets = [];
var tempName = "third";
var tempTimeDiff = 120;

io.sockets.on('connection', function (socket) {
    online++;
    connectedSockets.push(socket);
    console.log("client connected. Now online: " + online);

    // sends the Page info on init
    var page = sdmPage.findOne({ name: tempName }, { ContentArray: { $slice: 1 }
        , _id: 0, Timers: 0, Favorites: 0},// TODO: name is hardcoded
            function(err, page) { // TODO: check if Timers, Favorites and Settings still return when they are not empty
        if (err) return console.error(err);

        // determine local page time
        //var utc = Date.now();
        //var ClientDate = new Date(utc + page.Settings.TimeDiff * 60000);
        //console.log("page time:");
        //console.log(ClientDate);
        //
        //// check for each OneTime timer, if it has already passed
        //for (var i = 0; i < page.Timers.length; i++) {
        //    var t = page.Timers[i];
        //
        //    if (t.Type === "OneTime") {
        //        console.log();
        //        console.log("checking against timer:");
        //
        //        var timerdate = new Date(t.ActivationTime);
        //        console.log(timerdate);
        //
        //        if (timerdate < ClientDate) {
        //            console.log("timer removed:");
        //            console.log(t.ActivationTime);
        //
        //            page.Timers.splice(page.Timers.indexOf(t), 1);
        //            i--;
        //        }
        //    }
        //}

        console.log();
        console.log("sent init content to client:");
        console.log(page);
        socket.emit('pageinit', page);

        // updates page with deleted timers
        //page.save(function(err, obj) {
        //    if (err) console.error(err);
        //    //else console.log(obj);
        //});
    });


    // if a client pushes new content, update db and other clients
    socket.on('pushcontent', function (newcontent) {
        console.log("New content received: " + newcontent);

        // unshifts newcontent into ContentArray
        sdmPage.update(
            { name: tempName }, // TODO: name is hardcoded
            {
                $push: {
                    'ContentArray': { $each: [newcontent], $position: 0 } } // unshift
            }, function(err, obj) {
                if (err) return console.error(err);
                //console.log(newcontent + " pushed to database");
            }
        );

        // notify other clients
        for (var i = 0; i < connectedSockets.length; i++) {
            var s = connectedSockets[i];
            if (s != socket) {
                s.emit('contentupdate', {'CurrentContent': newcontent});
                console.log("another client notified: " + i);
            }
        }
    });

    // if a client pushes new timer, update db and and start setTimeout
    socket.on('savetimer', function (timer) {
        console.log("new timer received:");
        console.log(timer);

        sdmPage.update(
            { name: tempName }, // TODO: name is hardcoded
            {
                $push: { 'Timers': timer }
            }, function(err, obj) {
                if (err) return console.error(err);
            }
        );

        // determine current page time
        var utc = Date.now();
        var PageDate = new Date(utc + tempTimeDiff * 60000); // todo: tempTimeDiff hardcoded, should be sent along with request
        console.log(PageDate.toTimeString());

        // start settimeout
        if (timer.Type === "OneTime") {
            StartOneTimeTimer(socket, timer, PageDate);
        }
        else {
            StartWeeklyTimer(socket, timer, PageDate);
        }
    });



    socket.on('disconnect', function () {
        online--;
        connectedSockets.splice(connectedSockets.indexOf(socket), 1);
        console.log("Client disconnected. Now online: " + online);
    });
});


// --------|
// Express |
// --------|

// todo: at some point, the page name should be sent along with the request.

app.get('/', function(req, res) {
    res.send('Logging at /logs');
});
// logging
app.use('/logs', scribe.webPanel());

app.get('/get/history', function (request, response) { // params: skip, limit
    var skip = parseInt(request.param('skip'));
    var limit = parseInt(request.param('limit'));
    sdmPage.findOne({ name: tempName }, { ContentArray: { $slice: [skip, limit] }, // TODO: name is hardcoded
            name: 0, Timers: 0, Favorites: 0, Settings: 0, _id: 0 },  function(err, obj) {
        if (err) return console.error(err);

        console.log("Got history:");
        console.log(obj.ContentArray);
        response.send(obj.ContentArray);
    });
});

app.get('/get/timers', function (request, response) { // params: skip, limit
    // get timers associated with the page
});

// ----------|
// Functions |
// ----------|

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
var StartOneTimeTimer = function(socket, timer, pagedate) {
    //console.log(timer.ActivationTime);
    var timerdate = new Date(timer.ActivationTime);
    //console.log(timerdate.toTimeString());

    // find difference between timer and page date in milliseconds
    var diff = timerdate.getTime() - pagedate.getTime();

    console.log("Milliseconds until activation: " + diff);

    // Start setTimeout
    timer.TimeoutVar = setTimeout(function() {
        console.log("timeout hit!");
        if (timer.EndContent == "") {
            // delete timer from db
            sdmPage.findOne({'name': tempName}, function(err, page) {
                if (err) return console.log(err);

                console.log("timer:");
                console.log("Startcontent: " + timer.StartContent);
                console.log("ActivationTime " + timer.ActivationTime);


                // find the timers index. Could probably be done better but w/e
                var index = -1;
                console.log();
                for (var i = 0; i < page.Timers.length; i++) {
                    var t = page.Timers[i];
                    console.log("timer index " + i);
                    console.log("Startcontent: " + t.StartContent);
                    console.log("ActivationTime " + t.ActivationTime);
                    if (t.StartContent === timer.StartContent && t.ActivationTime === t.ActivationTime) {
                        index = i;
                        break;
                    }
                    console.log();
                }

                console.log("timer index:" + index);

                if (index > -1) {
                    page.Timers.splice(index, 1);
                    page.ContentArray.unshift(timer.StartContent);

                    page.save(function(err, obj) {
                        if (err) return console.error(err);
                        console.log("Timer removed from Array:");
                        console.log(timer);
                    });
                }
                else {
                    console.error("Timer could not be removed from array:");
                    console.error(timer);
                }
            });

            // create a package for the users <3
            var timerpackage = {
                'content': timer.StartContent
                // at some time, more should be added
            };

            // emit content to users
            for (var i = 0; i < connectedSockets.length; i++) {
                var s = connectedSockets[i];

                s.emit('timerfire', timerpackage);
            }
            console.log("users notified of timer update: " + connectedSockets.length);
        }
        else {
            // modify timer in db
            sdmPage.findOne({'name': tempName}, function(err, page) {
                if (err) return console.log(err);

                console.log("timer:");
                console.log("Startcontent: " + timer.StartContent);
                console.log("ActivationTime " + timer.ActivationTime);


                // find the timers index. Could probably be done better but w/e
                var index = -1;
                console.log();
                for (var i = 0; i < page.Timers.length; i++) {
                    var t = page.Timers[i];
                    console.log("timer index " + i);
                    console.log("Startcontent: " + t.StartContent);
                    console.log("ActivationTime " + t.ActivationTime);
                    if (t.StartContent === timer.StartContent && t.ActivationTime === t.ActivationTime) {
                        index = i;
                        break;
                    }
                    console.log();
                }

                console.log("timer index:" + index);

                if (index > -1) {
                    page.Timers.splice(index, 1);
                    page.ContentArray.unshift(timer.StartContent);

                    page.save(function(err, obj) {
                        if (err) return console.error(err);
                        console.log("Timer removed from Array:");
                        console.log(timer);
                    });
                }
                else {
                    console.error("Timer could not be removed from array:");
                    console.error(timer);
                }
            });
        }
    }, diff);
};
var StartWeeklyTimer = function(socket, timer, pagedate) {

};

server.listen(app.get('port'), function () {
    console.log("server started. Listening on port " + app.get('port'));
});