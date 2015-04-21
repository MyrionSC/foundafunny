var express = require('express'),
app = express(),
Parse = require('parse').Parse,
bodyParser = require('body-parser'),
http = require('http'),
socket = require('socket.io');


// keys for sdm-testdb on parse
Parse.initialize("tddpZ4wQt9lFdynC5u5WcjU9RG2HunQl5epfPZKp", "rtWeegY0PM1YMKGOdFNcP9F1d8ri2zNJvfUn7Rht");

var SDM_Current_Input = Parse.Object.extend("SDM_Current_Input");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.all('*',function(req,res,next)
{
    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin','http://localhost:63342'); // allows everyone to send requests
    //res.set('Access-Control-Allow-Origin','*'); // allows everyone to send requests
    res.set('Access-Control-Allow-Methods','GET,POST');
    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
    res.set('Access-Control-Allow-Credentials','true');

    if ('OPTIONS' == req.method) return res.status(200).end();

    next();
});

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

var io = socket.listen(server);
io.sockets.on('connection', function (socket) {
    console.log('Hello world japer daper duh');
    socket.emit('news', { hello: 'world' });
});

//app.listen(app.get('port'), function() {
//    console.log("Node app is running at localhost:" + app.get('port'));
//});

// get
app.get('/get/latestinput', function (request, response) {
    console.log("im trying le get latest input");

    var query = new Parse.Query(SDM_Current_Input);
    query.limit(1);
    query.descending("createdAt");
    query.first({
        success: function(ParseObj) {
            //response.type('json');
            var input = ParseObj.get("Input");
            var obj = '{"input": "'+ input + '"}';
            //var obj = "{input: " + input + "}";
            response.send(obj);
        },
        error: function() {
            response.send("error getting latest input");
        }
    });
});
app.get('/get/history', function (request, response) { // params: skip, limit
    console.log("im trying le get history");

    var skip = request.param('skip');
    var limit = request.param('limit');

    var query = new Parse.Query(SDM_Current_Input);
    query.skip(skip);
    query.limit(limit);
    query.descending("createdAt");
    query.find({
        success: function(ParseObjArray) {
            var ContentArray = [];
            for (var i = 0; i < ParseObjArray.length; i++) {
                var pao = ParseObjArray[i];
                ContentArray.push(pao.get('Input'));
            }
            response.send(ContentArray);
        },
        error: function() {
            response.send("error getting history");
        }
    });
});

//post
app.post('/post/newinput', function (request, res) {
    var newtext = new SDM_Current_Input();
    var Text = request.body.text;
    newtext.save({Input: Text}).then(function(object) {
        res.send("Success");
    });
});

// socket.io
//io.on('connection', function(socket) {
//    socket.emit('news', {hello: 'world'});
//    socket.on('event2', function (data) {
//        console.log(data);
//    });
//});
