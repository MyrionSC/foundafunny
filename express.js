// --------|
// Express |
// --------|

var db = require("./mongoDB.js");
var app = require('./app.js').app;
var console = process.console; // for logs

// todo: at some point, the page name should be sent along with the request.
app.get('/get/history', function (request, response) { // params: skip, limit
    console.log(request.originalUrl);
    var pagename = request.param('pagename').toString();
    var skip = parseInt(request.param('skip'));
    var limit = parseInt(request.param('limit'));
    console.log("Page " + pagename + " requested history");

    db.getHistory(pagename, skip, limit, function(err, obj) { // name hardcoded for now
        if (err) return console.error(err);
        console.log("Returned number of history items: " + obj.ContentArray.length);
        response.send(obj.ContentArray);
    });
});

app.get('/get/timers', function (request, response) {
    // get timers associated with the page
    var pagename = request.param('pagename').toString();
    console.log("Page " + pagename + " requested timers");

    db.getTimers(pagename, function(err, obj) {
        if (err) return console.error(err);

        // todo: sort timers by closest to activation

        console.log("Returned number of timers: " + obj.Timers);
        response.send(obj.Timers);
    });
});

