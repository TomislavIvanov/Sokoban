var express = require('express'),
	app = express(),
	http = require('http').Server(app);
    parser = require('body-parser');
    //io = require('socket.io')(http);

app.use(parser.json());
app.use(parser.urlencoded());
app.use(express.static(__dirname + '/'));
app.get('/', function (req, res) {
	console.log("/");
    res.sendFile(__dirname + '/login.html');
});

app.post('/login', function (req, res) {
	console.log(req);
    if(login(req.body.username, req.body.password)) {
        res.sendFile(__dirname + '/gameBoard.html');    
    } else{
        res.sendFile(__dirname + '/login.html');
    }
    
});

function login (user, pass) {
   return user === "admin" && pass === "123";
}

// io.on('connection', function (socket) {
//     'use strict';
// 	console.log('player connected');

//     socket.on('start game', function (fieldInfo) {
//         console.log('game started');
// 		//gameFinished = false;
//         currentGame = new gameInterface.constructor(fieldInfo, socket);
//     });
    
//     socket.on('change direction', function (direction) {
//         currentGame.changeDirection(direction);
//     });  

//     socket.on('end game', function () {
//         //gameFinished = true;
//         debugger;
//         currentGame.stopGame();
//         currentGame = null;
//         console.log('game finished');
//     });
  
//     socket.on('disconnect', function () {
// 		console.log('player disconnected');
//     });
// });

http.listen(3000, function () {
  'use strict';
  console.log('listening on *:3000');
});


