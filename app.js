require("dotenv").config(); // configure access to our .env

var express = require("express"); // Express web server framework
var cors = require("cors");
var cookieParser = require("cookie-parser");
var SpotifyWebApi = require("spotify-web-api-node");
var bodyParser = require("body-parser");
var ejs = require("ejs");

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
    })
  );
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
  var playlists = await findPlaylists(userId);
  console.log(playlists.body['items']);
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
  console.log(authorizationURL);
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
  } catch (err) {
    console.log("something went wrong :PP");
  }
  spotifyApi.setAccessToken(access_token);
  res.redirect("/categories");
});

// Find user's top artists
async function findTopArtists(userId, genre) {
  try {
    var topArtists = await spotifyApi.getMyTopArtists();
    topArtistsRefined = topArtists.body['items'];
  }
  catch {
    console.log("something went wrong with getting top artists :PP");
  }
}

// Find song recommendations
async function findTracks(topArtists, genres) {
  try {
    var tracks = spotifyApi.getRecommendations({
      seed_artists: topArtists,
      seed_genres: genres,
      limit: 10
    });
    return tracks;
  } catch {
    console.log("something went wrong with finding tracks for the playlist :PP");
  }
}

// Create a new playlist
async function createPlaylist(title, description) {
  try {
    var newPlaylist = await spotifyApi.createPlaylist(title, { 'description': description, 'public': true }, { position : 0 });
    return newPlaylist;
  }
  catch {
    console.log("something went wrong with creating the playlist :PP");
  }
}

async function addToPlaylist(playlistId, tracks) {
  try {
    await spotifyApi.addTracksToPlaylist(playlistId, tracks);
    console.log('Added tracks to playlist');
  } catch {
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
