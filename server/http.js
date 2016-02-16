// --------|
// Express |
// --------|

var db = require("./mongoDB.js");
var app = require('./../app.js').app;
var pages = require('./Pages.js');
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

        console.log(obj.Timers);

        // todo: sort timers by closest to activation
        obj.Timers.sort(function(a,b) {
            return a.ActivationTime - b.ActivationTime;
        });

        console.log(obj.Timers);

        console.log("Returned number of timers: " + obj.Timers.length);
        response.send(obj.Timers);
    });
});

app.post('/post/createpage', function(req, res) {
    console.log();
    console.log("Trying to create new page with name " + req.body.pagename);

    // check if page already exists
    if (pages.getPage(req.body.pagename) != undefined) {
        console.log("Page already exists");
        return res.send({status: 430});
    }
    // else create new page
    else {
        db.CreateNewPage(req.body, function() {
            console.log("New page with name " + req.body.pagename + " created in DB");

            // create in ram
            var settingsObj = {
                bgColor: req.body.bgColor,
                timezoneReadable: req.body.timezoneReadable,
                offset: req.body.offset
            };
            var pageobj = {
                Name: req.body.pagename,
                Settings: settingsObj,
                Favorites: []
            };
            pages.createPage(pageobj);
            console.log("New page with name " + req.body.pagename + " created in RAM");
            res.send({status: 200});
        });
    }
});

