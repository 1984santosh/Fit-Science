
var http = require("http");
var express = require("express");
var app = express();

app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/public'));
app.get("/", function(req, res) { 
	res.sendFile(__dirname + "/app/fit-science.html");
});

var server = http.createServer(app);

server.listen(3000, function(){
	console.log("fit-science app live at port 3000");
});