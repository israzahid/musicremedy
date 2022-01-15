var SpotifyWebApi = require('spotify-web-api-node');
var querystring = require('querystring');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET; 
const redirect_uri = 'http://localhost:8888/callback'; 
var statekey = 'spotify_auth_state';

var spotifyApi = new SpotifyWebApi({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
});

/* authentication */


/* get made for you playlists */


/* find songs under made for you playlists under same genre 
(up until some max number) */


/* add songs to playlist */


/* return playlist */

