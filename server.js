var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const nextId = 1
const players = {}
const keys = {}

server.listen(8000);

const position = {
  x: 0,
  y: 0
}

const mousePosition = {
  x: 0,
  y: 0
}


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

let move = function() {
  for (playerId in players) {
    if (keys[playerId]['up']) {
      players[playerId].y--;
    }
    if (keys[playerId]['down']) {
      players[playerId].y++;
    }
    if (keys[playerId]['left']) {
      players[playerId].x--;
    }
    if (keys[playerId]['right']) {
      players[playerId].x++;
    }
  }
}

io.on('connection', function (socket) {
  players[socket.id] = {
    color: Math.random() * 360,
    ang: 0,
    x: 0,
    y: 0,
    mousePosition
  }
  keys[socket.id] = {
    'up': false,
    'down': false,
    'left': false,
    'right': false
  }
  socket.on("mouseClick",data =>{
    let mx = data.mouseX;
    let my = data.mouseY;
    let px = players[socket.id].x + 20;
    let py = players[socket.id].y + 20;
    let angle = 180 * Math.atan(  (my - py) / (mx - px) ) / Math.PI;
    if (mx - px < 0) {
      angle -= 180;
    }
    console.log(my - py, mx - px, angle);
    players[socket.id].ang = angle;
    
  })

  socket.on("mouseMove", data => {
    // console.log('mouseMove', data)
    let mx = data.mouseX;
    let my = data.mouseY;
    let px = players[socket.id].x + 20;
    let py = players[socket.id].y + 20;
    let angle = 180 * Math.atan(  (my - py) / (mx - px) ) / Math.PI;
    if (mx - px < 0) {
      angle -= 180;
    }
    console.log(my - py, mx - px, angle);
    players[socket.id].ang = angle;
    // socket.emit('players', players);
    // socket.broadcast.emit('players', players);
    // console.log(mousePosition);
  });

  
  // socket.emit('players', players)
  setInterval(() => {
    move()
    socket.broadcast.emit('players', players)
  }, 20)
  // socket.emit('news', { hello: 'world' });
  // socket.on('my other event', function (data) {
    // console.log(data);
  // });
  console.log(socket.connected, socket.id)

  socket.on("disconnect", (data) => {
    delete players[socket.id]
    socket.broadcast.emit('players', players)
  })

  socket.on('down', (data) => {
    keys[socket.id][data] = true
  })

  socket.on('up', (data) => {
    keys[socket.id][data] = false
  })

  socket.on("move", function(data) {
    let sendData = () => {
      // for (playerId of Object.keys(players)) {
      //   let x = players[playerId].x
      //   let y = players[playerId].y

      //   socket.broadcast.emit("position", {
      //     playerId: playerId,
      //     x: x,
      //     y: y
      //   })
      //   socket.emit("position", {
      //     playerId: playerId,
      //     x: x,
      //     y: y
      //   })
      // }
      console.table(players)
      socket.emit('players', players)
      socket.broadcast.emit('players', players)
    }

    // socket.on('disconnect', function () {
    //   socket.emit('disconnected');
    //   online = online - 1;

    // });

    switch(data) {
      case "left":
        players[socket.id].x -= 30;

        //socket.emit("position", position);
        sendData()
        // console.log(position);
        break;
      case "right":
        players[socket.id].x += 20;
        // socket.emit("position", position);
        sendData()
        // console.log(position);
        break;
      case "up":
        players[socket.id].y -= 20;
        // socket.emit("position", position);
        sendData()
        // console.log(position);
        break;  
      case "down":
        players[socket.id].y += 20;
        // socket.emit("position", position);
        sendData()
        // console.log(position);
        break;  
    }
  })
});



