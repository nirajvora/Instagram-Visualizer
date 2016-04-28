var express = require('express');
var bodyParser = require('body-parser');

var open = require("open");
var http = require('http');
var api = require('instagram-node').instagram();
var env = require('node-env-file');
var app = express();

env(__dirname + '/process.env');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


api.use({
   client_id: process.env.CLIENT_ID,
   client_secret: process.env.CLIENT_SECRET
});

var redirect_uri = 'http://127.0.0.1:5000/redirect';


app.get('/authorize', function ( request, response ) {
    open('https://api.instagram.com/oauth/authorize/?client_id='+process.env.CLIENT_ID+'&redirect_uri='+'http://127.0.0.1:5000/redirect'+'&response_type=code', function( error ) {
        if(error) {
            console.log(error);
        }
    });
});

app.get('/redirect', function ( req, response ) {

    api.authorize_user(response.req.query.code, redirect_uri, function(err, result) {
        if (err) {
            console.log(err.body);
            res.send("Didn't work");
        } else {
            console.log('Yay! Access token is ' + result.access_token);
            response.send('You made it!!');
        }
    });




    //console.log(response.req.query.code);
    //var options = {
    //    url: "https://api.instagram.com/oauth/access_token",
    //    method: 'POST',
    //    oauth: {
    //        "client_id": process.env.CLIENT_ID,
    //        "client_secret": process.env.CLIENT_SECRET
    //    },
    //    json: {
    //        "client_id": process.env.CLIENT_ID,
    //        "client_secret": process.env.CLIENT_SECRET,
    //        "grant_type" : "authorization_code",
    //        "code" : response.req.query.code,
    //        "redirect_uri" : 'http://127.0.0.1:5000/redirect'
    //    }
    //};
    //
    //request(options, function ( error, response ) {
    //    if(error) { console.log(error); }
    //    else { console.log(JSON.stringify(response)); }
    //});
});

app.post('/getNetwork', function ( request, response ) {
    var username = request.body.username;
    var id = process.env.CLIENT_ID;
    var secret = process.env.CLIENT_SECRET;
    console.log("WE MADE IT");
    // request("http://www.sitepoint.com", function(error, response, body) {
    //   console.log(body);
    // });
});

//Start the server
var port = process.env.PORT || 5000;
console.log("Instagram Visualizer is listening on port", port);
app.listen(port);