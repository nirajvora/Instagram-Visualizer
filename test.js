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
    open(api.get_authorization_url(redirect_uri, { scope: ['public_content', 'follower_list'] }), function( error ) {
        if(error) { console.log(error); }
    });
    response.end();
    // open('https://api.instagram.com/oauth/authorize/?client_id='+process.env.CLIENT_ID+'&redirect_uri='+'http://127.0.0.1:5000/redirect'+'&response_type=code', function( error ) {
    //     if(error) {
    //         console.log(error);
    //     }
    // });
});

app.get('/redirect', function ( request, response ) {

    api.authorize_user(request.query.code, redirect_uri, function(err, result) {
        if (err) {
            console.log(err.body);
            response.send("Didn't work");
        } else {
            accessToken = result.access_token;
            response.redirect('http://127.0.0.1:5000/');
            response.end();
        }
    });
});

app.post('/getNetwork', function ( request, response ) {
    var username = request.body.username;
    console.log(username);

    var storage = {
        user: username,
        follows: null,
        followers: null
    };

    getUserInfo( username, storage, function( ) {
        var relations = {};
        var follows = storage.follows, followers = storage.followers;

        for(var i = 0; i < follows.length; i++) {
            relations[follows[i].username] = ['follow'];
        }

        for(var i = 0; i < followers.length; i++) {
            if(followers[i].username in relations) {
                relations[followers[i].username][0] = 'both';
            } else {
                relations[followers[i].username] = ['follower'];
            }
        }
        
        response.send({
            username: username,
            relations: relations
        });
    });
});

//Start the server
var port = process.env.PORT || 5000;
console.log("Instagram Visualizer is listening on port", port);
app.listen(port);

var getUserInfo = function( username, storage, callback ) {
    var ig = require('instagram-node').instagram({});
    ig.use({ access_token: accessToken });

    var userId = null;

    ig.user_search(username, {scope: 'public_content'}, function(err, users, remaining, limit) {
        if(err) { console.log('ERROR ID REQUEST', err) }
        else {
            console.log(users);
            console.log(users[0].id);
            userId = users[0].id;

            //CALLBACK REQUEST 1
            ig.user_follows(userId, {scope: 'follower_list'}, function(err, users, pagination, remaining, limit) {
               if(err) {
                   console.log('ERROR 1', username, err);
               } else {
                   console.log('USERS',users);
                   console.log('REMAINING',remaining);
                   console.log('LIMIT',limit);
                   storage.follows = users;

                   //CALLBACK REQUEST 2
                   ig.user_followers(userId, {scope: 'follower_list'}, function(err, users, pagination, remaining, limit) {
                      if(err) {
                          console.log('ERROR 2', username, err);
                      } else {
                          console.log('USERS',users);
                          console.log('REMAINING',remaining);
                          console.log('LIMIT',limit);
                          storage.followers = users;


                          if(callback) { callback(); };

                      }
                   });

               }
            });
        }
    });

};