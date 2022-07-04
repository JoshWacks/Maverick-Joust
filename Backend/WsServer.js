/*
* User Class that stores the socket and the status of the user in the current game.
*/
class User {
  constructor(socket){
      this.socket = socket
      this.alive = true
  }

  kill(){
      this.alive = false
  }
}

/*
* Session Class to encapsulate the Users playing and associate them with a session for the
* current game they are playing.
*/
class Session {
  constructor(sessionId, userCount){
      this.sessionId = sessionId
      this.userCount = userCount
      this.users = []
  }

  AddUser(socket){
    if(this.userCount >= this.users.length){
        let user = new User(socket);
        this.users.push(user)
    }
    else{
        // nReturn lobby full
    }
}

KillUser(socket){
    var curUser = this.users.find((user) => user.socket == socket)
    curUser.kill();
}
}

/*
* In memory storage of all currently active Sessions. Also acts as a controller to 
* the Sessions.
*/
class SessionList {
  constructor(){
      this.sessions = []
  }

  print(sessionID) {
    var curSession = this.sessions.find((session) => session.sessionId == sessionID)
    for (let i=0; i< curSession.users.length; i++) {
      console.log(curSession.users[i].alive);
    }
  }

  KillUser(ws, sessionID) {
    var curSession = this.sessions.find((session) => session.sessionId == sessionID)
      if(!curSession){
        // Implement Error Response
        console.log("Session does not exist");
        return
      }
      else{
        curSession.KillUser(ws);
      }
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
    while(this.sessions.find((session) => session.sessionId == sessionid)){
      sessionid = (Math.random() + 1).toString(36).substring(9)
    }

    let session = new Session(sessionid, playerCount)
    this.sessions.push(session)
    return sessionid
  }
}




/* ==========================================================
* Servers
============================================================= */

/* WebSocket Server */

const { create } = require('domain');
const fs = require('fs');
const http = require('http');
const { join } = require('path');
const WebSocket = require('ws');

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
      Sessions.KillUser(ws, obj.sessionID);
      Sessions.print(obj.sessionID);
    }
    
  });

});
server.listen(8080);
console.log("Listening on 8080");


/* Express Server */

const express = require('express');
const app = express();

const expressPort = 5050;

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var httpServer = app.listen(expressPort, function() {
  console.log("Express Server Listening on Port " + expressPort);
});

app.post("/game/create", urlencodedParser,  (request, response) => {

  const count = request.body.playerCount;

  var sesID = Sessions.AddSession(count);
  response.end(JSON.stringify({
    sessionID : sesID
  }))
  
});


