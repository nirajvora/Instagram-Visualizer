var express = require('express');
var bodyParser = require('body-parser');

var open = require("open");
var http = require('http');
var api = require('instagram-node').instagram();
var env = require('node-env-file');
var app = express();

var accessToken = "";

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

app.get('/redirect', function ( request, response ) {

    api.authorize_user(request.query.code, redirect_uri, function(err, result) {
        if (err) {
            console.log(err.body);
            res.send("Didn't work");
        } else {
            accessToken = result.access_token;
            response.redirect('http://127.0.0.1:5000/');
        }
    });
});

app.post('/getNetwork', function ( request, response ) {
    var ig = require('instagram-node').instagram({});
    ig.use({ access_token: accessToken });

    var username = request.body.username;
    console.log(username);

    //ig.user_followers(username, function(err, users, pagination, remaining, limit) {
    //    if(err) { console.log('ERROR', err) }
    //    else {
    //        console.log('USERS',users);
    //        console.log('PAGEINATION',pagination);
    //        console.log('REMAINING',remaining);
    //        console.log('LIMIT',limit);
    //    }
    //});

});

//Start the server
var port = process.env.PORT || 5000;
console.log("Instagram Visualizer is listening on port", port);
app.listen(port);

