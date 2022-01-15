/* configure access to our .env */
require("dotenv").config();

var express = require('express');

var router = express.Router();

var SpotifyWebApi = require('spotify-web-api-node');
var querystring = require('querystring');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET; 
const redirect_uri = 'http://localhost:8888/'; // http://localhost:8888/callback
const scope = ['user-read-private', 'user-read-email'];
var statekey = 'spotify_auth_state';

var spotifyApi = new SpotifyWebApi({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
});

/* GET */
router.get('/', function(req, res) {
    console.log('here');
    res.send('GET handler for spotifyController');
    authenticate(res);
});

router.get('/callback', function(req, res) {

// your application requests refresh and access tokens
// after checking the state parameter

var code = req.query.code || null;
var state = req.query.state || null;
var storedState = req.cookies ? req.cookies[stateKey] : null;

if (state === null || state !== storedState) {
    res.redirect('/#' +
    querystring.stringify({
        error: 'state_mismatch'
    }));
} else {
    res.clearCookie(stateKey);
    var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
    },
    headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
    };
     request.post(authOptions, function(error, response, body) {
       if (!error && response.statusCode === 200) {
 
         var access_token = body.access_token,
             refresh_token = body.refresh_token;
 
         var options = {
           url: 'https://api.spotify.com/v1/me',
           headers: { 'Authorization': 'Bearer ' + access_token },
           json: true
         };
 
         // use the access token to access the Spotify Web API
         request.get(options, function(error, response, body) {
           console.log(body);
         });
 
         // we can also pass the token to the browser to make requests from there
         res.redirect('/#' +
           querystring.stringify({
             access_token: access_token,
             refresh_token: refresh_token
           }));
       } else {
         res.redirect('/#' +
           querystring.stringify({
             error: 'invalid_token'
           }));
       }
     });
   }
 });
// authenticate();

/* authentication */
authenticate = function (res) {
    var state = generateRandomString(16);
    res.cookie(statekey, state);
    var authorizeURL = spotifyApi.createAuthorizeURL(scope, state);
    console.log(authorizeURL);
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
}));

    // // Retrieve an access token and a refresh token
    // spotifyApi.authorizationCodeGrant().then(
    //     function(data) {
    //       console.log('The token expires in ' + data.body['expires_in']);
    //       console.log('The access token is ' + data.body['access_token']);
    //       console.log('The refresh token is ' + data.body['refresh_token']);
      
    //       // Set the access token on the API object to use it in later calls
    //       spotifyApi.setAccessToken(data.body['access_token']);
    //       spotifyApi.setRefreshToken(data.body['refresh_token']);
    //     },
    //     function(err) {
    //       console.log('Something went wrong!', err);
    //     }
    // );
}

// authenticate();
/* get made for you playlists */


/* find songs under made for you playlists under same genre 
(up until some max number) */


/* add songs to playlist */


/* return playlist */


/* helper functions */
 function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

module.exports = router;