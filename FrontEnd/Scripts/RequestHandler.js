var _sessionID;
var _socket;

function clickCreateGame() {
    var count = document.getElementById("numPlayers").value;
    createGame(count);
}

function createGame(playerCount){

    alert("Creating");

    //var playerCount = document.getElementById("numPlayers").value;

    var obj = {
        "playerCount": playerCount
    }

    var http = new XMLHttpRequest();
    
    http.onreadystatechange = function() {
        
        if (http.readyState == 4) {
            console.log(http.responseText);
            _sessionID = JSON.parse(http.responseText).sessionID;
            joinGame(JSON.parse(http.responseText).sessionID);
        }
    };

    http.open("POST", "http://localhost:5050/game/create", false);
    http.send(JSON.stringify(obj));

}

function clickJoinGame() {
    var sessionID = document.getElementById("sessionID").value;
    joinGame(sessionID);
}

function joinGame(sessionID){

    alert("Joining");
    _socket = new WebSocket("ws://localhost:8080");

    _socket.onopen = function() {
                    
        var obj = {
            "type": "join",
            "sessionID": sessionID
        }

        _socket.send(JSON.stringify(obj));
    }

    _socket.onmessage = function(message) {
        const obj = JSON.parse(message.data);
        const type = obj.type;
        console.log(obj);
    }

}