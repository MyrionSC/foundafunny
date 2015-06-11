var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose = require ("mongoose");
//bodyParser = require('body-parser');
//var Parse = require('parse').Parse;


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

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
//mongoose.connect(uristring, function (err, res) {
//    if (err) {
//        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
//    } else {
//        console.log ('Succeeded connected to: ' + uristring);
//    }
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
//// Creating one user.
//var johndoe = new PUser ({
//    name: { first: 'John', last: '  Doe   ' },
//    age: 25
//});
//
//// Saving it to the database.
//johndoe.save(function (err) {if (err) console.log ('Error on save!')});
//
//// Creating more users manually
//var janedoe = new PUser ({
//    name: { first: 'Jane', last: 'Doe' },
//    age: 65
//});
//janedoe.save(function (err) {if (err) console.log ('Error on save!')});
//
//// Creating more users manually
//var alicesmith = new PUser ({
//    name: { first: 'Alice', last: 'Smith' },
//    age: 45
//});
//alicesmith.save(function (err) {if (err) console.log ('Error on save!')});


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

// keys for sdm-testdb on parse
//Parse.initialize("tddpZ4wQt9lFdynC5u5WcjU9RG2HunQl5epfPZKp", "rtWeegY0PM1YMKGOdFNcP9F1d8ri2zNJvfUn7Rht");

//var SDM_Current_Input = Parse.Object.extend("SDM_Current_Input");

app.get('/get/latestinput', function (req, res) {
    console.log("im trying le get latest input");

    //var query = new Parse.Query(SDM_Current_Input);
    //query.limit(1);
    //query.descending("createdAt");
    //query.first({
    //    success: function(ParseObj) {
    //        //console.log(ParseObj.get("Input"));
    //        res.send(ParseObj.get("Input"));
    //    },
    //    error: function() {
    //        //console.log("error getting latest input");
    //        res.send("error getting latest input");
    //    }
    //});

    res.send("not implemented");

    //var query = new Parse.Query(SDM_Current_Input);
    //query.limit(1);
    //query.descending("createdAt");
    //query.first({
    //    success: function(ParseObj) {
    //        //response.type('json');
    //        //var input = ParseObj.get("Input");
    //        //var obj = '{"input": "'+ input + '"}';
    //        ////var obj = "{input: " + input + "}";
    //        //response.send(obj);
    //        response.send(ParseObj.get("Input"));
    //    },
    //    error: function() {
    //        response.send("error getting latest input");
    //    }
    //});
});

app.get('/get/history', function (request, response) { // params: skip, limit
    console.log("im trying le get history");

    var skip = request.param('skip');
    var limit = request.param('limit');

    //var query = new Parse.Query(SDM_Current_Input);
    //query.skip(skip);
    //query.limit(limit);
    //query.descending("createdAt");
    //query.find({
    //    success: function(ParseObjArray) {
    //        var ContentArray = [];
    //        for (var i = 0; i < ParseObjArray.length; i++) {
    //            var pao = ParseObjArray[i];
    //            ContentArray.push(pao.get('Input'));
    //        }
    //        response.send(ContentArray);
    //    },
    //    error: function() {
    //        response.send("error getting history");
    //    }
    //});

    var ContentArray = [];
    for (var i = 0; i < limit; i++) {
        var j = parseInt(skip) + i;
        console.log("skip: " + parseInt(skip));
        console.log("limit: " + parseInt(limit));
        console.log("skip + i: " + j);
        ContentArray.push(j + "hey");
    }
    response.send(ContentArray);
});

//post
app.post('/post/newinput', function (request, res) {
    console.log("I'm trying le push input");
    //var newtext = new SDM_Current_Input();
    //var Text = request.body.text;
    //newtext.save({Input: Text}).then(function(object) {
    //    res.send("Success");
    //});
    res.send("not implemented");
});

//app.get('/get/latestinput', function (req, res) {
//    console.log("im trying le get latest input");
//
//    res.send("you got it");
//});

server.listen(app.get('port'), function () {
    console.log("server started. Listening on port " + app.get('port'));
});










//var express = require('express'),
//app = express(),
//Parse = require('parse').Parse,
//bodyParser = require('body-parser'),
//http = require('http'),
//socket = require('socket.io');
//
//
//// keys for sdm-testdb on parse
//Parse.initialize("tddpZ4wQt9lFdynC5u5WcjU9RG2HunQl5epfPZKp", "rtWeegY0PM1YMKGOdFNcP9F1d8ri2zNJvfUn7Rht");
//
//var SDM_Current_Input = Parse.Object.extend("SDM_Current_Input");
//
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
//
//app.set('port', (process.env.PORT || 5000));
//app.use(express.static(__dirname + '/public'));
//
//app.all('*',function(req,res,next)
//{
//    if (!req.get('Origin')) return next();
//
//    //res.set('Access-Control-Allow-Origin','http://localhost:63342');
//    res.set('Access-Control-Allow-Origin','*'); // allows everyone to send requests
//    res.set('Access-Control-Allow-Methods','GET,POST');
//    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
//    res.set('Access-Control-Allow-Credentials','true');
//
//    if ('OPTIONS' == req.method) return res.status(200).end();
//
//    next();
//});
//
////app.listen(app.get('port'), function() {
////    console.log("Node app is running at localhost:" + app.get('port'));
////});
//
//// get
//app.get('/get/latestinput', function (request, response) {
//    console.log("im trying le get latest input");
//
//    var query = new Parse.Query(SDM_Current_Input);
//    query.limit(1);
//    query.descending("createdAt");
//    query.first({
//        success: function(ParseObj) {
//            //response.type('json');
//            var input = ParseObj.get("Input");
//            var obj = '{"input": "'+ input + '"}';
//            //var obj = "{input: " + input + "}";
//            response.send(obj);
//        },
//        error: function() {
//            response.send("error getting latest input");
//        }
//    });
//});
//
//app.get('/get/history', function (request, response) { // params: skip, limit
//    console.log("im trying le get history");
//
//    var skip = request.param('skip');
//    var limit = request.param('limit');
//
//    var query = new Parse.Query(SDM_Current_Input);
//    query.skip(skip);
//    query.limit(limit);
//    query.descending("createdAt");
//    query.find({
//        success: function(ParseObjArray) {
//            var ContentArray = [];
//            for (var i = 0; i < ParseObjArray.length; i++) {
//                var pao = ParseObjArray[i];
//                ContentArray.push(pao.get('Input'));
//            }
//            response.send(ContentArray);
//        },
//        error: function() {
//            response.send("error getting history");
//        }
//    });
//});
//
////post
//app.post('/post/newinput', function (request, res) {
//    var newtext = new SDM_Current_Input();
//    var Text = request.body.text;
//    newtext.save({Input: Text}).then(function(object) {
//        res.send("Success");
//    });
//});
//
//
//
//var server = http.createServer(app).listen(app.get('port'), function(){
//    console.log("Express server listening on port " + app.get('port'));
//});

//var io = socket.listen(server);
//io.sockets.on('connection', function (socket) {
//    console.log('Hello world japer daper duh');
//    setTimeout(function () {
//        socket.emit('news', { hello: 'world' });
//    }, 3000);
//});

// socket.io
//io.on('connection', function(socket) {
//    socket.emit('news', {hello: 'world'});
//    socket.on('event2', function (data) {
//        console.log(data);
//    });
//});
