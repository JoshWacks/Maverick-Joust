const { create } = require('domain');
const fs = require('fs');
const http = require('http');
const { join } = require('path');
const WebSocket = require('ws');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

var clients = Map();

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    const obj = JSON.parse(message);
    const type = obj.type;

  if (type == "join") {
      join(ws, obj.sessionID);
    }
    else if (type == "lose") {
      lose(message);
    }
  });

});
server.listen(8080);
console.log("Listening on 8080");



const express = require('express');
const app = express();

var httpServer = app.listen(5050, function() {

});

app.post("/game/create", (request, response) => {

  const obj = JSON.parse(request.body);
  var sesID = create();
  response.end(JSON.stringify({
    sessionID : sesID
  }))
  
});

