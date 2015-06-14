var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose = require ("mongoose");
//bodyParser = require('body-parser');

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());

app.set('port', (process.env.PORT || 5000));

app.all('*',function(req,res,next)
{
    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin','*'); // allows everyone to send requests
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
    ContentArray: Array,
    Favorites: Array,
    Settings: {
        bg_color: String // TODO: add some youtube settings and such later
    },
    Timers: Array
});
var sdmPage = mongoose.model("sdmpage", sdmSchema);







//PUser.findOne({ 'name.first': 'Jane' }, function(err, obj) {
//    if (err) return console.error(err);
//    console.dir(obj);
//});

//
//// This is the schema.  Note the types, validation and trim
//// statements.  They enforce useful constraints on the data.
//var userSchema = new mongoose.Schema({
//    name: {
//        first: String,
//        last: { type: String, trim: true }
//    },
//    age: { type: Number, min: 0}
//});
//
//// Compiles the schema into a model, opening (or creating, if
//// nonexistent) the 'PowerUsers' collection in the MongoDB database
//var PUser = mongoose.model('PowerUsers', userSchema);
//
//// Clear out old data
//PUser.remove({}, function(err) {
//    if (err) {
//        console.log ('error deleting old data.');
//    }
//});
//
////// Creating one user.
//var johndoe = new PUser ({
//    name: { first: 'John', last: '  Doe   ' },
//    age: 25
//});
//// Saving it to the database.
//johndoe.save(function (err) {if (err) console.log ('Error on save!')});

// Find a single movie by name.
//Movie.findOne({ title: 'Thor' }, function(err, thor) {
//    if (err) return console.error(err);
//    console.dir(thor);
//});

//// Find all movies.
//Movie.find(function(err, movies) {
//    if (err) return console.error(err);
//    console.dir(movies);
//});
//
//// Find all movies that have a credit cookie.
//Movie.find({ hasCreditCookie: true }, function(err, movies) {
//    if (err) return console.error(err);
//    console.dir(movies);
//});


// ----------|
// Socket.IO |
// ----------|

var online = 0;
var connectedSockets = [];

io.sockets.on('connection', function (socket) {
    online++;
    connectedSockets.push(socket);
    console.log("client connected. Now online: " + online);

    for (var i = 0; i < connectedSockets.length; i++) {
        var s = connectedSockets[i];
        s.emit('news', {'online': online});
    }

    //socket.on('event2', function (data) {
    //    console.log(data);
    //});

    socket.on('disconnect', function () {
        online--;
        connectedSockets.splice(connectedSockets.indexOf(socket), 1);
        console.log("Client disconnected. Now online: " + online);
    });
});


// --------|
// Express |
// --------|

app.get('/get/updatepage', function (req, res) { // params: pagename
    console.log("sending latest page data");

    sdmPage.findOne({ name: 'first' }, function(err, page) {
        if (err) return console.error(err);
        res.send(page);
    });
});

app.get('/get/latestinput', function (req, res) {
    console.log("im trying le get latest input");



    res.send("not implemented");
});

app.get('/get/history', function (request, response) { // params: skip, limit
    console.log("im trying le get history");

    var skip = request.param('skip');
    var limit = request.param('limit');

    var ContentArray = [];
    for (var i = 0; i < limit; i++) {
        var j = parseInt(skip) + i;
        //console.log("skip: " + parseInt(skip));
        //console.log("limit: " + parseInt(limit));
        //console.log("skip + i: " + j);
        ContentArray.push(j + " not implemented");
    }
    response.send(ContentArray);
});

//post
app.post('/post/newinput', function (request, res) {
    console.log("I'm trying le push input");

    res.send("not implemented");
});

server.listen(app.get('port'), function () {
    console.log("server started. Listening on port " + app.get('port'));
});

// ----------|
// Functions |
// ----------|

// generate new sdm instance
var initMongoDB = function (Name) {
    var newmongo = new sdmPage({
        name: Name
    });
    newmongo.save(function (err) {if (err) console.log('Error on save of db: ' + Name)});
};

