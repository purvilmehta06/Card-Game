var express = require('express');
var path = require("path");
var socket = require('socket.io');
var app = express();
const bodyParser = require('body-parser')
const http = require('http');
var uuid = require('uuid');
app.use(express.static(path.join(__dirname, 'public')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug')
// parse application/json
app.use(bodyParser.json());

// Socket.io integration with express
const server = http.createServer(app);

// Creating the socket
const io = socket(server);

var roomCode = [];
var playerName = [];
maxCount = [];
playerCount = [];

app.get('/',(req,res)=>{
  res.render('main');
})

app.post('/joingame',(req,res)=>{
  var room = uuid.v4()
  roomCode.push(room);
  maxCount[room] = req.body.player;
  playerCount[room] = 0;
  res.redirect('/'+room);
})

suits = ['C','D','H','S']
cardNumber = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
card = [];

for(j=0;j<4;++j){
  for(i=0;i<13;++i){
    card.push({
      cardNumber : cardNumber[i],
      suit : suits[j],
      name: cardNumber[i]+suits[j]+'.png'
    })
  }
}

app.get('/:id',(req,res)=>{
  var found = roomCode.find(e => e == req.params.id);
  if(found && playerCount[req.params.id] < maxCount[req.params.id]){ 
    var admin;
    if(playerCount[req.params.id] == 0)
      admin = true
    else    
      admin = false
    res.render('play',{roomCode: req.params.id,admin:admin});
  }
  else
    res.render('notfound');
})


io.on('connection',(socket=>{
  console.log("Connected");

  socket.on('name',(msg)=>{
    socket.join(msg.roomCode);
    socket.name = msg.name;
    socket.roomCode = msg.roomCode;
    console.log(socket.roomCode)
    playerCount[msg.roomCode]++;
    console.log(playerCount[socket.roomCode])
    playerName.push({player:msg.name,roomCode:msg.roomCode,socketId:socket.id});
    io.in(msg.roomCode).emit('player', playerName);
  })

  socket.on('start',()=>{
    var remove = 52%playerCount[socket.roomCode];
    for(i=0;i<5;++i)
      shuffle(card);
    sockets = [];
    for( i=0;i<playerName.length;++i){
      if(playerName[i].roomCode == socket.roomCode)
        sockets.push(playerName[i].socketId)
    }
    var j=0;
    for(i=0;i<52;++i){
      if(card[i].cardNumber == '2' && remove>0){
        --remove;
        continue;
      }
      else
        io.to(sockets[(j++)%(sockets.length)]).emit('sendData', card[i]);
    }
  })

  socket.on('turn',data=>{
    io.in(socket.roomCode).emit('msg', data);
  })

  socket.on('card',data=>{
    console.log(data);
    io.in(socket.roomCode).emit('cardMsg',{data:data,maxCount:maxCount[socket.roomCode]});
  })

  socket.on('clear',()=>{
    io.in(socket.roomCode).emit('clearBoard');
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
    var index;
    for(index=0;index<playerName.length;++index){
      if(playerName[index].player == socket.name)
        break;
    }
    playerName.splice(index,1);
    playerCount[socket.roomCode]--;
    if(playerCount[socket.roomCode] == 0)
      roomCode.splice(roomCode.indexOf(socket.roomCode),1);
    io.in(socket.roomCode).emit('player', playerName);
  });
}))


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

let PORT = 5000
server.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}...`
  )
});