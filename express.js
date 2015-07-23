// --------|
// Express |
// --------|

var db = require("./mongoDB.js");
var app = require('./app.js').app;
var console = process.console; // for logs
var tempName = "third";

// todo: at some point, the page name should be sent along with the request.
app.get('/get/history', function (request, response) { // params: skip, limit
    var skip = parseInt(request.param('skip'));
    var limit = parseInt(request.param('limit'));

    db.getHistory(tempName, skip, limit, function(err, obj) { // name hardcoded for now
        if (err) return console.error(err);

        console.log("Got history:");
        console.log(obj.ContentArray);
        response.send(obj.ContentArray);
    });
});

app.get('/get/timers', function (request, response) {
    // get timers associated with the page
    db.getTimers(tempName, function(err, obj) {
        if (err) return console.error(err);

        // todo: sort timers by closest to activation

        console.log("Got Timers:");
        console.log(obj.Timers);
        response.send(obj.Timers);
    });
});

