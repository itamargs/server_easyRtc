// Load required modules
var https   = require("https");     // https server core module
var fs      = require("fs");        // file system core module
var express = require("express");   // web framework external module
var io      = require("socket.io"); // web socket external module
// var cors = require('cors');

// This sample is using the easyrtc from parent folder.
// To use this server_example folder only without parent folder:
// 1. you need to replace this "require("../");" by "require("easyrtc");"
// 2. install easyrtc (npm i easyrtc --save) in server_example/package.json

var easyrtc = require("easyrtc");; // EasyRTC internal module

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var httpApp = express();
httpApp.use(express.static(__dirname + "/static/"));
// httpApp.use(cors({ origin: 'http://localhost:4200' , credentials :  true}));


httpApp.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

 // Add this
 if (req.method === 'OPTIONS') {

      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, OPTIONS');
      res.header('Access-Control-Max-Age', 120);
      return res.status(200).json({});
  }

  next();

});


// Start Express https server on port 8443
var webServer = https.createServer({
    key:  fs.readFileSync(__dirname + "/server.key"),
    cert: fs.readFileSync(__dirname + "/server.crt")
}, httpApp);

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer, {"log level":1});

// Start EasyRTC server
var rtc = easyrtc.listen(httpApp, socketServer);

// Listen on port 8443
webServer.listen(process.env.PORT || 5000, function () {
    var port = webServer.address().port;
    console.log('listening on https://localhost in port ' + port);
});

