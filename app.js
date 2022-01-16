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

app.get("/categories", function (req, res) {
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
});

// Instantiate Spotify Web API
var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri,
});

/* authentication */
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
    console.log(`Code: ${code}`);
    var data = await spotifyApi.authorizationCodeGrant(code);
    console.log("The token expires in " + data.body["expires_in"]);
    console.log("The access token is " + data.body["access_token"]);
    console.log("The refresh token is " + data.body["refresh_token"]);
    var access_token = data.body["access_token"];
  } catch (err) {
    console.log("something went wrong :PP");
  }
  spotifyApi.setAccessToken(access_token);
  res.redirect("/categories");
});

/* get made for you playlists */

/* find songs under made for you playlists under same genre 
(up until some max number) */

/* add songs to playlist */

/* return playlist */

/* helper functions */
var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

console.log(`Listening on ${PORT}`);
app.listen(PORT);
