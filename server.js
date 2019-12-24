// Load required modules
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var serveStatic = require('serve-static');  // serve static files
var socketIo = require("socket.io");        // web socket external module

// This sample is using the easyrtc from parent folder.
// To use this server_example folder only without parent folder:
// 1. you need to replace this "require("../");" by "require("easyrtc");"
// 2. install easyrtc (npm i easyrtc --save) in server_example/package.json

var easyrtc = require("easyrtc"); // EasyRTC internal module

// Set process name
process.title = "node-easyrtc";

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var app = express();
app.use(serveStatic('static', {'index': ['index.html']}));

// Start Express http server on port 8080
var webServer = http.createServer(app);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, {"log level":1});

easyrtc.setOption("logLevel", "debug");

// var appIceServers = [                                    // Array of STUN and TURN servers. By default there is only publicly available STUN servers.
//     {urls: "stun:stun.l.google.com:19302"},
//     {urls: "stun:stun.sipgate.net"},
//     {urls: "stun:217.10.68.152"},
//     {urls: "stun:stun.sipgate.net:10000"},
//     {urls: "stun:217.10.68.152:10000"}
// ];

// easyrtc.setOption("appIceServers", appIceServers);


// var myIceServers = [
//     {"urls":"stun:stun:numb.viagenie.ca:443"},
//     {
//       "urls":"turn:stun:numb.viagenie.ca:443", 
//       "username":"itamargs111@gmail.com",
//       "credential":"igwebrctpass"
//     },
//     {
//         "urls":"turn:stun:numb.viagenie.ca?:443transport=tcp", 
//         "username":"itamargs111@gmail.com",
//         "credential":"igwebrctpass"
//     }
//   ];





// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

easyrtc.on("getIceConfig", function(connectionObj, callback){
    var myIceServers=[
      {"url":"stun:numb.viagenie.ca:3478"},
      {
        "url":        "turn:numb.viagenie.ca:3478",
        "username":   "itamargs111@gmail.com",
        "credential": "igwebrctpass"
      }
    ];
    console.log(callback(null, myIceServers));
  });



// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});




// Listen on port 8443
webServer.listen(process.env.PORT, function () {
    var port = webServer.address().port;
    console.log('listening on http://localhost in port ' + port);
});

