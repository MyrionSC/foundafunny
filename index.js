var express = require('express');
var app = express();
var Parse = require('parse').Parse;

Parse.initialize("tddpZ4wQt9lFdynC5u5WcjU9RG2HunQl5epfPZKp", "rtWeegY0PM1YMKGOdFNcP9F1d8ri2zNJvfUn7Rht");

var SDM_Current_Input = Parse.Object.extend("SDM_Current_Input");

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

//app.get('/', function(request, response) {
//    console.log("i have been kicked");
//
//
//    //var peopleJson = "{" +
//    //    "People: [" +
//    //        "{" +
//    //            "firstname: 'Thomas'," +
//    //            "lastname: 'Raith'" +
//    //        "}," +
//    //        "{" +
//    //            "firstname: 'Harry'," +
//    //            "lastname: 'Dresden'" +
//    //        "}" +
//    //    "]" +
//    //"}";
//    //response.type('json');
//    //response.send(peopleJson);
//    response.send("fuck off");
//});

app.get('/get/latestinput', function (request, response) {
    console.log("im trying le get");

    var query = new Parse.Query(SDM_Current_Input);
    query.limit(1);
    query.descending("createdAt");
    query.first({
        success: function(ParseObj) {
            //response.type('json');
            var input = ParseObj.get("Input");
            response.send(input);
        },
        error: function() {
            response.send("error");
        }
    });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
//
//
//

//var express = require('express');
//var app = express();
////var bodyParser = require('body-parser');
////var mongodb = require('mongodb');
////var mongouri = process.env.MONGOLAB_URI;
//var Parse = require('parse').Parse;
//
//Parse.initialize("tddpZ4wQt9lFdynC5u5WcjU9RG2HunQl5epfPZKp", "rtWeegY0PM1YMKGOdFNcP9F1d8ri2zNJvfUn7Rht");
//
//app.set('port', (process.env.PORT || 5000));
//app.use(express.static(__dirname + '/public'));
////app.use(bodyParser.json());
////app.use(bodyParser.urlencoded());
//
//
//
//var TextObj = Parse.Object.extend("Text");
//var SDM_Current_Input = Parse.Object.extend("SDM_Current_Input");
//
////app.all('*',function(req,res,next)
////{
////    if (!req.get('Origin')) return next();
////
////    res.set('Access-Control-Allow-Origin','*');
////    res.set('Access-Control-Allow-Methods','GET,POST');
////    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
////
////    if ('OPTIONS' == req.method) return res.send(200);
////
////    next();
////});
//
//app.get('/', function(request, response) {
//
//
//    //var result = ;
//    //var times = process.env.TIMES ||;
//    //for (i=0; i < times; i)
//    //    result += cool;
//    //response.send(result);
//});
//
//// get
////app.get('/get/TextArray', function (request, response) {
////    var query = new Parse.Query(TextObj);
////    query.find({
////        success: function(text) {
////            var textarray = [];
////            for (var i = 0; i < text.length; ++i) {
////                textarray.push(text[i].get('text'));
////            }
////            response.type('json');
////            response.send(textarray);
////        }
////    });
////});
//app.get('/SDM/get/CurrentInput', function (request, response) {
//    console.log("im trying le get");
//
//    var query = new Parse.Query(SDM_Current_Input);
//    query.limit(1);
//    query.descending("createdAt");
//    query.first({
//        success: function(ParseObj) {
//            response.type('json');
//            response.send(ParseObj.get("Input"));
//        },
//        error: function() {
//            response.send("error");
//        }
//    });
//});
//
//// post
////app.post('/post/TextPost', function (request, res) {
////    var newtext = new TextObj();
////    Text = request.body;
////    newtext.save({text: Text}).then(function(object) {
////        res.send("Success");
////    });
////});
////app.post('/SDM/post/InputString', function (request, res) {
////    var newtext = new SDM_Current_Input();
////    Text = request.body.text;
////    newtext.save({Input: Text}).then(function(object) {
////        res.send("Success");
////    });
////});
//
//app.listen(app.get('port'), function() {
//    console.log("Node app is running at localhost:" + app.get('port'));
//});