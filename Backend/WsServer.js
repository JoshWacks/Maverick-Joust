const { create } = require('domain');
const fs = require('fs');
const http = require('http');
const { join } = require('path');
const WebSocket = require('ws');

class User {
  constructor(socket){
      this.socket = socket
      this.alive = true
  }

  kill(){
      this.alive = false
  }
}

class Session {
  constructor(sessionId, socketsCount){
      this.sessionId = sessionId
      this.socketsCount = socketsCount
      this.sockets = []
  }

  AddUser(socket){
    if(this.userCount >= this.users.length){
        user = new User

        this.users.push(socket)
    }
    else{
        // nReturn lobby full
    }
}

KillUser(socket){
    var curUser = this.users.find((user) => user.socket == socket)
}
}

class SessionList {
  constructor(){
      this.sessions = []
  }

  AddSocketToSession(ws, sessionId){
      var curSession = this.sessions.find((session) => session.sessionId == sessionId)
      if(!curSession){
        // Implement Error Response
        console.log("Session does not exist");
        return
      }
      else{
        curSession.AddUser(ws)
      }
  }

  AddSession(playerCount = 100){
    let sessionid = 'AAA'
    //Check SessionID is unique
    while(this.sessions.find((session) => session.sessionId == sessionId)){
      sessionid = (Math.random() + 1).toString(36).substring(9)
    }

    let session = new Session(sessionid, playerCount)
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
    //console.log('received: %s', message);

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
var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var httpServer = app.listen(5050, function() {

});

app.post("/game/create", urlencodedParser,  (request, response) => {

  const count = request.body.playerCount;
  //console.log(request.body);
  //const obj = JSON.parse(request.body);
  var sesID = Sessions.AddSession(count);
  response.end(JSON.stringify({
    sessionID : sesID
  }))
  
});

