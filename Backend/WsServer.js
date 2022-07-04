const { create } = require('domain');
const fs = require('fs');
const http = require('http');
const { join } = require('path');
const WebSocket = require('ws');

class Session {
  constructor(sessionId, socketsCount){
      this.sessionId = sessionId
      this.socketsCount = socketsCount
      this.sockets = []
  }

  AddUser(socket){
      if(this.socketsCount >= this.sockets.length){
          this.sockets.push(socket)
      }
  }
}

class SessionList {
  constructor(){
      this.sessions = []
  }

  AddSocketToSession(ws, sessionId){
      var curSession = this.sessions.find((session) => session.sessionId == sessionId)
      curSession.AddUser(ws)
      console.log(sessions)
  }

  AddSession(playerCount = 100){
      let sessionid = '1'
      //Implement ID System
      session = new Session(sessionid, playerCount)
      this.sessions.push(session)
      return sessionid
  }
}

const server = http.createServer();
const wss = new WebSocket.Server({ server });

var clients = new Map();
var Sessions = new SessionList();

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    const obj = JSON.parse(message);
    const type = obj.type;

  if (type == "join") {
      Sessions.AddSocketToSession(ws, obj.sessionID);
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
  var sesID = Sessions.AddSession();
  response.end(JSON.stringify({
    sessionID : sesID
  }))
  
});


