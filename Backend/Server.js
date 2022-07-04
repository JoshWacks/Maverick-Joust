var express = require("express");
var app = express();

const Port = 8080;

var server = app.listen(Port, function() {
    console.log("Server running on port: " + Port);
});

app.post("/game/create", function(request, response) {
    
});

app.post("/game/join", function(request, response) {
    
});

app.get("/game/lose", function(request, response) {
    
});

