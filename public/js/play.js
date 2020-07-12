const roomCode = document.getElementById('roomCode').innerHTML
const admin = document.getElementById('admin').innerHTML
var playCorner = document.getElementById('playCorner'); 
var turn,username,myrank,count = 0 ;
var playerNames = [];
var counterSuit = [];
counterSuit['S'] = 0;
counterSuit['D'] = 0;
counterSuit['C'] = 0;
counterSuit['H'] = 0;


var socket = io.connect();
(async () => {
const { value: name } = await Swal.fire({
  title: 'Enter your name',
  input: 'text',
  inputPlaceholder: 'Please enter your name'
})
socket.emit('name',{name:name,roomCode:roomCode})
username = name;
})()

socket.on('player',playerList =>{
  playerNames = [];
  var list = document.getElementById("livedata");
  while (list.hasChildNodes())  
    list.removeChild(list.firstChild); 
  for(i=0; i<playerList.length; i++){
    if(playerList[i].roomCode == roomCode){
      var node = document.createElement("LI");   
      playerNames.push(playerList[i].player) 
      if(playerList[i].player == username)
        myrank = i;    
      node.appendChild(document.createTextNode(playerList[i].player)); 
      node.setAttribute("id",playerList[i].player);              
      document.getElementById("livedata").appendChild(node);
    }
  }
})

var invite = document.getElementById('invite').innerHTML = "Invitation Link :" + window.location.hostname + '/' + roomCode;
function start(){
  document.getElementById('start').style.visibility = 'hidden'
  socket.emit('start');
  setTimeout(askTurn, 3000 );
}


var i = 0;
socket.on('sendData',data=>{
  if(admin == "false")
    document.getElementById('waitingMsg').style.visibility = 'hidden'
  var imgStack = document.getElementById('imgStack');
  //- for(var i=0;i<13;++i)
  //- {

  counterSuit[data.suit]++;

  var elem = document.createElement("img");
  elem.src = '/images/'+data.name;
  elem.setAttribute("height", "200");
  elem.setAttribute("width", "150");
  elem.setAttribute('id',i);
  imgStack.appendChild(elem); 
  document.getElementById(i).style.margin = "0 0 0 "+ (-100)+"px";

  //- }
  //- var td;
  //- for (var t = 0; t < 13; t++){
    
  //- }
  td = document.getElementById(i);
  if (typeof window.addEventListener === 'function'){
    (function (_td) {
      td.addEventListener('click', function(){
          if(turn == username){
            let suit = _td.src.split("/").pop().split(".")[0];
            if(count>0){
              let check = document.getElementById('play0').src;
              check = check.split("/").pop().split(".")[0];
              console.log(check,suit)
              var suitIndex = suit.length - 1
              var checkIndex = check.length - 1
              if(check[checkIndex]!=suit[suitIndex] && counterSuit[check[checkIndex]] != 0)
                return;
            }
            
            counterSuit[suit[suitIndex]]--;
          
            _td.style.visibility='hidden'
            turn = playerNames[(myrank+1)%(playerNames.length)];
            socket.emit('turn',turn);
            socket.emit('card',_td.src);
          }
      });
    })(td);
  }
  ++i;
  
})

function askTurn(){
  var inputOptions = {}
  for(i=0;i<playerNames.length;++i){
    inputOptions[playerNames[i]] = playerNames[i]  
  }
  (async () => {
  const { value: color } = await Swal.fire({
    title: 'Select Player for first turn',
    input: 'radio',
    inputOptions: playerNames,
    inputValidator: (value) => {
      if (!value) {
        return 'You need to enter name!'
      }
    }
  })
  turn = playerNames[color] ;
  
  socket.emit('turn',turn)
   })()
}

socket.on('msg',data=>{
  turn = data;
  var name = document.getElementById(turn);
  for(i=0;i<playerNames.length;++i){
    document.getElementById(playerNames[i]).style.border = "none";
  }
  name.style.border = "thick solid #0000FF"

})

socket.on('cardMsg',data=>{
  var elem = document.createElement("img");
  elem.src = data.data;
  elem.setAttribute("height", "200");
  elem.setAttribute("width", "150");
  playCorner.appendChild(elem); 
  elem.setAttribute('id','play'+count);
  document.getElementById('play'+count).style.margin = "0 0 0 "+ (-100)+"px";
  ++count;
  
  if(count == data.maxCount){
    count = 0;
    for(i=0;i<playerNames.length;++i){
      document.getElementById(playerNames[i]).style.border = "none";
    }
    setTimeout(doit,10000);
  }
})

socket.on('clearBoard',()=>{
  while (playCorner.hasChildNodes())  
    playCorner.removeChild(playCorner.firstChild); 
})

function doit(){
  socket.emit('clear');
  turn = "";
  if(admin == "true") 
    askTurn();
}