require("dotenv").config(); // configure access to our .env

var express = require("express"); // Express web server framework
var cors = require("cors");
var cookieParser = require("cookie-parser");
var SpotifyWebApi = require("spotify-web-api-node");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var favicon = require('serve-favicon');
var path = require('path');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = "http://localhost:8888/callback";
const scope = ["user-read-private", "user-read-email"];
const stateKey = "spotify_auth_state";
const PORT = 8888;

var app = express();

app
  .use(express.static(__dirname + "/public"))
  .use(cors())
  .use(cookieParser())
  .use(
    bodyParser.urlencoded({
      extended: true,
    }))
  .use(favicon(path.join(__dirname, 'public', 'images/favicon.ico')))
  .use('/public/images', express.static(__dirname + '/public/images'));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/categories", async (req, res) => {
  var categories = [
    {
      title: "Pain Relief",
      number: 1,
    },
    {
      title: "Managing Depression",
      number: 2,
    },
    {
      title: "Promoting Wellness",
      number: 3,
    },
    {
      title: "Improving Memory",
      number: 4,
    },
    {
      title: "Sleep",
      number: 5,
    },
    {
      title: "Stress Management",
      number: 6,
    },
  ];
  res.render("categories", {
    categories: categories,
  });
  var userId = await getUserId(); // returns userId, string
  console.log(`UserID: ${userId}`);
  let topTracks = await findTopTracks();
  console.log(topTracks);
  // var topTracks = 
  //     ['5iFwAOB2TFkPJk8sMlxP8g', '5z8qQvLYEehH19vNOoFAPb']
  //   ;
  var genres = [
      'indie pop', 'indie poptimism', 'easy listening'
    ];
  // var genTracks = await findTracks(topTracks, genres); 
  // var genTracksURIs = genTracks[0];
  // var genTracksInfo = genTracks[1];
  // console.log(`Generated recommended tracks`);
  // var newPlaylist = await generatePlaylist(userId, 'Pain Relief', 'Here is a therapeutic pain relief playlist');
  // console.log(newPlaylist);
  // var playlistId = '1dmCfhZzi5q4EGdqJGp4sl';
  // addToPlaylist(userId, playlistId, genTracksURIs);
});

app.get("/playlist", function(req, res){
  res.render("playlist");
});

// Instantiate Spotify Web API
var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri,
});

// Authentication
app.get("/login", function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  var authorizationURL = spotifyApi.createAuthorizeURL(scope, state);
  res.redirect(authorizationURL);
});

app.get("/callback", async (req, res) => {
  var code = req.query.code || null;
  if (code == null) {
    console.log("code isi null");
  }
  try {
    var data = await spotifyApi.authorizationCodeGrant(code);
    var access_token = data.body["access_token"];
    console.log('Authenticated');
  } catch (err) {
    console.log("something went wrong :PP");
  }
  spotifyApi.setAccessToken(access_token);
  res.redirect("/categories");
});

// Find user's top tracks, return a list of song IDs
async function findTopTracks() {
  try {
    let topTracks = await spotifyApi.getMyTopTracks({ time_range: 'long_term', limit:20, offset:0 });
    console.log(`${topTracks} and also ${typeof(topTracks)}`);
    // var topTracksRefined = topTracks['items'];
    // console.log(topTracksRefined);
    return topTracks;
  }
  catch (err) {
    console.log("something went wrong with getting top tracks :PP");
    console.log(err);
  }
}

// Find song recommendations
async function findTracks(topTracks, genres) {
  try {
    var tracksInfo = await spotifyApi.getRecommendations({ // idea !! seed artists but also customize other factors
      seed_tracks: topTracks, // list of song IDs
      seed_genres: genres, // list of genre names
      limit: 10
    });
    var genTracks = tracksInfo.body['tracks'];
    var genTracksURIs = [], genTracksInfo = [];
    for (let i = 0; i < 10; i++) {
      try {
        genTracksURIs.push(genTracks[i].uri);
        genTracksInfo.push({ title: genTracks[i].name, artists: genTracks[i].artists, duration: genTracks[i].duration_ms});
      } catch (err) {
        console.log('there was an error in adding trackURI or info :P');
      }
    }
    return [genTracksURIs, genTracksInfo];
  } catch (err) {
    console.log("something went wrong with finding tracks for the playlist :PP");
  }
}

// Create a new playlist
async function generatePlaylist(userId, title, description) {
  try {
    console.log('creating new playlist');
    var newPlaylist = await spotifyApi.createPlaylist(userId, title, { public: false });
    return newPlaylist;
  }
  catch (err) {
    console.log("something went wrong with creating the playlist :PP");
  }
}

async function addToPlaylist(userId, playlistId, tracks) {
  try {
    await spotifyApi.addTracksToPlaylist(userId, playlistId, tracks);
    console.log('Added tracks to playlist');
  } catch (err) {
    console.log("something went wrong with adding songs to the playlist :PP");
  }
}

// Helper functions
var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

async function getUserId() {
  try {
    var data = await spotifyApi.getMe();
    return data.body['id'];
  } catch (err) {
    console.log("something went wrong with fetching user data :PP");
  }
}

console.log(`Listening on ${PORT}`);
app.listen(PORT);
