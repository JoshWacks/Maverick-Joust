

/*
* Session Class to encapsulate the Users playing and associate them with a session for the
* current game they are playing.
*/
class Session {
  constructor(sessionId, userCount){
      this.sessionId = sessionId
      this.userCount = userCount
      this.users = []
      this.activeUsers = 0;
  }

  AddUser(socket){
    if(this.userCount >= this.users.length){
        let user = new User(socket);
        this.users.push(user)
        this.activeUsers++;
    }
    else{
      socket.send(JSON.stringify({
        "type" : "join",
        "status" : "Failed: Lobby is Full!"
      }));
    }
  }

  KillUser(socket){
      var curUser = this.users.find((user) => user.socket == socket)
      curUser.kill();

      if (--this.activeUsers == 1) {
        var curUser = this.users.find((user) => user.alive == true)
        curUser.socket.send(JSON.stringify({
          "type" : "win"
        }));
      }
  }

  // removeUser(socket) {
  //   this.KillUser(socket);
  //   let curUser = this.users.((user) => user.socket == socket);
  //   this.users.splice(0,1);
    
  // }

  reset() {
    for (let i=0; i<this.users.length; i++) {
      this.users[i].reset();
    }
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
        ws.send(JSON.stringify({
          "type" : "join",
          "status" : "Failed: Session Does Not Exist!"
        }));

        return
      }
      else{
        curSession.AddUser(ws)
      }
  }

  AddSession(playerCount = 5){
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

const sessions = []

// Gernerates new session, adds to sessions list and returns sessionId
function generateSession(playerCount = 5){
  let session = {
    players: [],
    maxPlayerCount: playerCount,
    alivePlayerCount: function () {
      var aliveCount = 0
      for (let index = 0; index < this.players.length; index++) {
        const element = this.players[index];
        if(element.alive){
          aliveCount ++
        }
      }
      return aliveCount
    }, 
    sessionId: function () {
      let sesId = 'AAA'

      //Check SessionID is unique
      while(sessions.find((session) => session.sessionId == sesId)){
        sesId = (Math.random() + 1).toString(36).substring(9)
      }

      return sesId
    }()
  }
  sessions.push(session)
  
  return session.sessionId
}

function findSession(ws,sessionId){
  const session = sessions.find((session) => session.sessionId == sessionId)
  if(!session){
    ws.send(JSON.stringify({
      "type" : "join",
      "status" : "Failed: Session Does Not Exist!"
    }));

    return
  }
  else{
    return session
  }
}

function findPlayer(ws,session){
  const player = session.players.find((player) => player.ws == ws)
  if(!player){
    return
  }
  else{
    return player
  }
}

function addPlayerToSession(ws, sessionId){
  const session = findSession(ws, sessionId)
  if(session){
    console.log(session.players.length);
    console.log(session.maxPlayerCount);
    if(session.players.length < session.maxPlayerCount){
      if(findPlayer(ws,session)){
        ws.send(JSON.stringify({
          "type" : "join",
          "status" : "Failed: Player aready Exist!"
        }));
  
        return
      }
      else{
        // Check player already joined
        const newPlayer = {
          ws: ws,
          alive: true
        }
        session.players.push(newPlayer)
      }
    }
    else{
      ws.send(JSON.stringify({
        "type" : "join",
        "status" : "Failed: Lobby is Full!"
      }));
    }
  }
}

function killPlayer(ws, sessionId){
  const session = findSession(ws,sessionId)
  if(session){
    const player = findPlayer(ws,session)
    if(player){
      player.alive = false

      ws.send(JSON.stringify({
        "type" : "kill",
        "status" : "You are killed."
      }));

      checkGameOver(session)

      return

    }
  }
}

function checkGameOver(session){
  if(session.alivePlayerCount() <= 1){
    const winner = session.players.find((player) => player.alive == true)
      // Message sent to losers
      for (let index = 0; index < session.players.length; index++) {
        var element = session.players[index];
        if (element.ws == winner.ws){
          element.ws.send(JSON.stringify({
            "type" : "Win",
            "status" : "Wel done you are slightly above averagre compared to the rest"
          }));
        }
        else{
          element.ws.send(JSON.stringify({
            "type" : "Lose",
            "status" : "Mission failed.. We'll get them next time troops"
          }));
        }
      }
  }
}

function removePlayer(ws, sessionId){
  const session = findSession(ws,sessionId)
  if(session){
    const player = findPlayer(ws,session)
    if(player){
      killPlayer(ws, sessionId)
      session.players.splice(session.players.indexOf(player),1)
      return

    }
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

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {
  console.log('received: %s', message);

    const obj = JSON.parse(message);
    const type = obj.type;

    if (type == "join") {
      addPlayerToSession(ws, obj.sessionID)
    }
    else if (type == "lose") {
      killPlayer(ws, obj.sessionID);
    }
    
  });

  ws.on("close", function close() {
      //removePlayer(ws, obj.sessionID)
  })

});

server.listen(8080);
console.log("Listening on 8080");


/* Express Server */

const express = require('express');
const app = express();

const expressPort = 5050;

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

var httpServer = app.listen(expressPort, function() {
  console.log("Express Server Listening on Port " + expressPort);
});

app.post("/game/create", function(request, response) {

  const count = request.body.playerCount;
  console.log(request.body);
  console.log(count);
  var sesID = generateSession(count);

  response.end(JSON.stringify({
    "sessionID" : sesID
  }));
  
});


