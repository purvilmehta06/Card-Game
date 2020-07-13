//Global Methods Declaration
const roomCode = document.getElementById('roomCode').innerHTML
const admin = document.getElementById('admin').innerHTML
var playCorner = document.getElementById('playCorner'); 
if(admin=='true'){
  document.getElementById('doit').style.visibility = 'hidden'
  document.getElementById('startSame').style.visibility = 'hidden'
  document.getElementById('start').disabled = true;
}

//Glabal Variables
var turn,username,myrank,count = 0,totalCards=0;
var playerNames = [];
var counterSuit = [];
var score = {};
counterSuit['S'] = 0;
counterSuit['D'] = 0;
counterSuit['C'] = 0;
counterSuit['H'] = 0;

//Connecting to server's socketS
var socket = io.connect();

//Ask Name to user 
(async () => {
const { value: name } = await Swal.fire({
  title: 'Enter your name',
  input: 'text',
  inputPlaceholder: 'Please enter your name'
})
socket.emit('name',{name:name,roomCode:roomCode})
username = name;
})()


//Whenever new player is added
socket.on('player',playerList =>{
  playerNames = [];
  if(admin=='true' && playerList.length>=3)
    document.getElementById('start').disabled = false;
  if(admin == 'true' && playerList.length <3)
  document.getElementById('start').disabled = true;
  var list = document.getElementById("livedata");
  var list2 = document.getElementById("players");
  var list3 = document.getElementById("score");
  if(admin == 'true')
    var scoreManage = document.getElementById('scoreManage');
  while (list.hasChildNodes())  
    list.removeChild(list.firstChild); 
  while (list2.hasChildNodes())  
    list2.removeChild(list2.firstChild);
  while (list3.hasChildNodes())  
    list3.removeChild(list3.firstChild);  
  if(admin=='true'){
    while (scoreManage.hasChildNodes())  
      scoreManage.removeChild(scoreManage.firstChild);  
  }
  for(i=0; i<playerList.length; i++){
    if(playerList[i].roomCode == roomCode){
      var node = document.createElement("LI");   
      var node2 = document.createElement("LI"); 
      var node3 = document.createElement("LI");  
      if(admin == 'true'){ 
        var x = document.createElement("INPUT");
        x.setAttribute("type", "number");
        x.setAttribute('id',"add"+playerList[i].player)
        document.getElementById('scoreManage').appendChild(x);
      }
      playerNames.push(playerList[i].player) 
      if(playerList[i].player == username)
        myrank = i;    
      node.appendChild(document.createTextNode(playerList[i].player));
      score[playerList[i].player] = 0; 
      node2.appendChild(document.createTextNode(playerList[i].player)); 
      node3.appendChild(document.createTextNode(score[playerList[i].player])); 
      node.setAttribute("id",playerList[i].player);  
      node3.setAttribute("id","score"+playerList[i].player);              
      document.getElementById("livedata").appendChild(node);
      document.getElementById("players").appendChild(node2);
      document.getElementById("score").appendChild(node3);
    }
  }
})

//Displaying Invitation Link
var invite = document.getElementById('invite').innerHTML = "Invitation Link : " + window.location.hostname + '/' + roomCode;

//Start fuction (only for admin) to start the game
function start(){
  document.getElementById('start').style.visibility = 'hidden'
  document.getElementById('startSame').style.visibility = 'hidden'
  if(admin=='true')
  {
    document.getElementById('doit').style.visibility = 'visible'
  }
  socket.emit('start');
  setTimeout(askTurn, 3000 );
}

//This method will be called whenever cards are received.
var i = 0;
socket.on('sendData',data=>{
  if(admin == "false")
    document.getElementById('waitingMsg').style.visibility = 'hidden'
  var imgStack = document.getElementById('imgStack');

  counterSuit[data.suit]++;

  var elem = document.createElement("img");
  elem.src = '/images/'+data.name;
  elem.setAttribute("height", "200");
  elem.setAttribute("width", "150");
  elem.setAttribute('id',i);
  imgStack.appendChild(elem); 
  document.getElementById(i).style.margin = "0 0 0 "+ (-110)+"px";
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
              console.log(suitIndex,checkIndex)
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
  ++totalCards;
})


//Asking admin about the ne=xt hand first turn
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

//Highlight player with the turn
socket.on('msg',data=>{
  turn = data;
  var name = document.getElementById(turn);
  for(i=0;i<playerNames.length;++i){
    document.getElementById(playerNames[i]).style.border = "none";
  }
  name.style.border = "thick solid #0000FF"

})

//This will called when player played some card
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
  }
})

//Clears the table
socket.on('clearBoard',()=>{
  while (playCorner.hasChildNodes())  
    playCorner.removeChild(playCorner.firstChild); 
})

//Asking user for next turn
function doit(){
  --totalCards;
  count = 0;
  if(totalCards == 0){
    clearEverything();
    socket.emit('clearAll');
    return;
  }
  socket.emit('clear');
  turn = "";
  if(admin == "true") 
    askTurn();
}

//Clear all boards - initialising to base values
function clearEverything(){
  while (playCorner.hasChildNodes())  
    playCorner.removeChild(playCorner.firstChild); 
  while (imgStack.hasChildNodes())  
    imgStack.removeChild(imgStack.firstChild); 

  counterSuit['S'] = 0;
  counterSuit['D'] = 0;
  counterSuit['C'] = 0;
  counterSuit['H'] = 0;

  count = 0;
  totalCards = 0;
  turn = "";

  if(admin=='true'){
    document.getElementById('start').style.visibility = 'visible'
    document.getElementById('doit').style.visibility = 'hidden'
    document.getElementById('startSame').style.visibility = 'visible'
  }
}

//Send scoreboard
function send(){
  for(i =0 ;i<playerNames.length;++i)
  {
    if(document.getElementById('add'+playerNames[i]).value)
      score[playerNames[i]] = parseInt(score[playerNames[i]]) + parseInt(document.getElementById('add'+playerNames[i]).value);
  }
  console.log(score);
  socket.emit('sendScore',score);
}

//rec Scoreboard
socket.on('recScore',score=>{
  for(i=0;i<playerNames.length;++i){
    console.log(score[playerNames[i]]);
    document.getElementById('score'+playerNames[i]).innerHTML = (score[playerNames[i]]).toString(10);
  }
})

//Clear Scoreboard
function clearScoreboard(){
  for(i=0;i<playerNames.length;++i)
    score[playerNames[i]] = 0;
  socket.emit('sendScore',score);
  start();
}

socket.on('clearEverything',()=>{
  clearEverything();
})