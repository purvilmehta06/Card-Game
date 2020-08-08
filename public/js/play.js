//Global Methods Declaration
const roomCode = document.getElementById('roomCode').innerHTML
const admin = document.getElementById('admin').innerHTML
const gameType = document.getElementById('gameType').innerHTML
var playCorner = document.getElementById('playCorner'); 
if(admin=='true'){
  document.getElementById('doit').style.visibility = 'hidden'
  document.getElementById('startSame').style.visibility = 'hidden'
  document.getElementById('start').disabled = true;
  document.getElementById('end').style.visibility = 'hidden';
}
if(gameType == 'Declare')
  document.getElementById('hands').style.visibility = 'hidden'
document.getElementById('declare').style.visibility = 'hidden';

//Glabal Variables
var turn,username,myrank,count = 0,totalCards=0,cardsCount = 0,unique = 0,expectedCards;
var declarePlayer;
var playerNames = [];
var counterSuit = [];
var declareScore = {};
var score = {};
counterSuit['S'] = 0;
counterSuit['D'] = 0;
counterSuit['C'] = 0;
counterSuit['H'] = 0;
cards = {
  'S':[],
  'D':[],
  'C':[],
  'H':[]
}

//Connecting to server's socketS
var socket = io.connect();

//Ask Name to user 
(async () => {
const { value: name } = await Swal.fire({
  title: 'Enter your name',
  input: 'text',
  allowOutsideClick: false,
  inputPlaceholder: 'Please enter your name',
  inputValidator: (value) => {
    if (!value) {
      return 'You need to enter name!'
    }
  }
})
socket.emit('name',{name:name,roomCode:roomCode})
username = name;
})()


//Whenever new player is added
socket.on('player',playerList =>{
  playerNames = [];
  if(admin=='true' && playerList.length>=3){
    document.getElementById('start').disabled = false;
    document.getElementById('startSame').disabled = false;
  }
  if(admin == 'true' && playerList.length <3){
    document.getElementById('start').disabled = true;
    document.getElementById('startSame').disabled = true;
  }
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

//Start fuction (only for admin) to start the game
function start(){
  if(gameType == 'Declare')
    document.getElementById('hands').value = Math.floor(52/playerNames.length);
  if(!document.getElementById('hands').value || document.getElementById('hands').value*playerNames.length>52 || document.getElementById('hands').value<=0)
    return;
  document.getElementById('start').style.visibility = 'hidden'
  document.getElementById('startSame').style.visibility = 'hidden'
  if(admin=='true')
  {
    document.getElementById('doit').style.visibility = 'visible'
    document.getElementById('hands').style.visibility = 'hidden'
    document.getElementById('end').style.visibility = 'visible';
  }

  socket.emit('start',document.getElementById('hands').value);
  
  askTurn();
}

//This method will be called whenever cards are received.
socket.on('sendData',(data,e)=>{
  expectedCards = e;
  if(admin == "false")
    document.getElementById('waitingMsg').style.visibility = 'hidden'
  
  if(gameType == 'Declare')
    document.getElementById('declare').style.visibility = 'visible';
  var imgStack = document.getElementById('imgStack');

  counterSuit[data.suit]++;
  cards[data.suit].push(data);
  var elem = document.createElement("img");
  elem.src = '/images/'+data.name;
  elem.setAttribute("height", "200");
  elem.setAttribute("width", "150");
  elem.setAttribute('id',unique);
  imgStack.appendChild(elem); 
  document.getElementById(unique).style.margin = "0 0 0 "+ (-110)+"px";
  td = document.getElementById(unique);
  if (typeof window.addEventListener === 'function'){
    (function (_td) {
      td.addEventListener('click', function(){
          if(turn == username){
            let suit = _td.src.split("/").pop().split(".")[0];
            var suitIndex = suit.length - 1
            if(count>0){
              let check = document.getElementById('play0').src;
              check = check.split("/").pop().split(".")[0];
              
              var checkIndex = check.length - 1
              if(check[checkIndex]!=suit[suitIndex] && counterSuit[check[checkIndex]] != 0){
                return;
              }
            }
            counterSuit[suit[suitIndex]]--;
          
            _td.style.visibility='hidden'
            turn = playerNames[(myrank+1)%(playerNames.length)];
            socket.emit('turn',turn,false);
            socket.emit('card',_td.src);
          }
      });
    })(td);
  }
  ++unique;
  ++totalCards;
  if(totalCards == expectedCards)
    setCards();
  cardsCount = totalCards;
})

function setCards(){
  var index = 0; 
  var dummy = cards['S'];
  dummy.sort((a,b) => (a.weight > b.weight) ? 1 : ((b.weight > a.weight) ? -1 : 0)); 
  for(i=0;i<dummy.length;++i){
    document.getElementById(index).src = '/images/'+dummy[i].name;
    ++index;
  }
  dummy = cards['D'];
  dummy.sort((a,b) => (a.weight > b.weight) ? 1 : ((b.weight > a.weight) ? -1 : 0)); 
  for(i=0;i<dummy.length;++i){
    document.getElementById(index).src = '/images/'+dummy[i].name;
    ++index;
  }
  dummy = cards['C'];
  dummy.sort((a,b) => (a.weight > b.weight) ? 1 : ((b.weight > a.weight) ? -1 : 0)); 
  for(i=0;i<dummy.length;++i){
    document.getElementById(index).src = '/images/'+dummy[i].name;
    ++index;
  }
  dummy = cards['H'];
  dummy.sort((a,b) => (a.weight > b.weight) ? 1 : ((b.weight > a.weight) ? -1 : 0)); 
  for(i=0;i<dummy.length;++i){
    document.getElementById(index).src = '/images/'+dummy[i].name;
    ++index;
  }
}

//Asking admin about the ne=xt hand first turn
function askTurn(){
  if(gameType == 'Declare')
    socket.emit('toggle');
  var inputOptions = {}
  for(i=0;i<playerNames.length;++i){
    inputOptions[playerNames[i]] = playerNames[i]  
  }
  (async () => {
  const { value: color } = await Swal.fire({
    title: 'Select Player for first turn',
    input: 'radio',
    allowOutsideClick: false,
    inputOptions: playerNames,
    inputValidator: (value) => {
      if (!value) {
        return 'You need to enter name!'
      }
    }
  })
  turn = playerNames[color] ;
  
  socket.emit('turn',turn,false)
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
    turn = "";
    if(gameType == 'Declare')
      socket.emit('toggle');
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
  for(i=0;i<playerNames.length;++i){
    document.getElementById(playerNames[i]).style.border = "none";
  }
  counterSuit['S'] = 0;
  counterSuit['D'] = 0;
  counterSuit['C'] = 0;
  counterSuit['H'] = 0;

  count = 0;
  totalCards = 0;
  turn = "";
  unique = 0;
  cards = {
    'S':[],
    'D':[],
    'C':[],
    'H':[]
  }

  if(admin=='true'){
    document.getElementById('start').style.visibility = 'visible'
    document.getElementById('doit').style.visibility = 'hidden'
    document.getElementById('startSame').style.visibility = 'visible'
    document.getElementById('end').style.visibility = 'hidden';
    document.getElementById('hands').style.visibility = 'visible';
  }
  if(gameType == 'Declare')
    document.getElementById('declare').style.visibility = 'hidden';
}

//Send scoreboard
function send(){
  for(i =0 ;i<playerNames.length;++i)
  {
    if(document.getElementById('add'+playerNames[i]).value)
      score[playerNames[i]] = parseInt(score[playerNames[i]]) + parseInt(document.getElementById('add'+playerNames[i]).value);
  }
  socket.emit('sendScore',score);
}

//rec Scoreboard
socket.on('recScore',score=>{
  for(i=0;i<playerNames.length;++i){
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

function endGame(){
  socket.emit('clearAll');
}

//Counts the points after one game of declare
function countPoints(){
  var points = 0;
  for(i=0;i<cardsCount;++i){
    if(document.getElementById(i).style.visibility != 'hidden'){
      let card = document.getElementById(i).src.split("/").pop().split(".")[0];
      if(card.length == 2){
        if(card[0]=='A'){
          points+=1;
        }else if(card[0]=='K'){
          points+=13;
        }else if(card[0]=='Q'){
          points+=12;
        }else if(card[0]=='J'){
          points+=11;
        }else 
          points+=parseInt(card[0]);
      }
      else  
        points += 10;
    }
  }
    
  socket.emit('myScore',{name:username,points:points});
}

function declare(){
  socket.emit('declare',username);
  socket.emit('clearAll');
}

socket.on('recDeclareOffer',(data)=>{
  countPoints();
  if(admin == 'true')
    declarePlayer = data;
})


//Displays scores to screen
socket.on('declarePoints',data=>{
  declareScore[data.name] = data.points;
  if(Object.keys(declareScore).length == playerNames.length)
  {
    var s = "";
    
    for(i=0;i<playerNames.length;++i){
      s = s + playerNames[i] + " : " + declareScore[playerNames[i]] + "<br>";
    }
    if(admin == 'true'){
      var flag = 0;
      for(i=0;i<playerNames.length;++i){
        if(declareScore[playerNames[i]]<declareScore[declarePlayer]){
          declareScore[playerNames[i]] = 0;
          flag = 1;
        }
      }
      if(flag)
        declareScore[declarePlayer] = declareScore[declarePlayer]*2; 
      else  
        declareScore[declarePlayer] = 0;
      for(i=0;i<playerNames.length;++i){
        document.getElementById('add'+playerNames[i]).value = declareScore[playerNames[i]]
      }
    } 
    Swal.fire({
      title: 'Scores!',
      html: s,
    })
    if(admin=='true')
      document.getElementById('send').click();
    declareScore = {}
  }
})
  
//Manages when declare button is on or off.
socket.on('toggleDeclare',()=>{
  toggleDeclare();
})
function toggleDeclare(){
  document.getElementById('declare').disabled = !document.getElementById('declare').disabled;
}
