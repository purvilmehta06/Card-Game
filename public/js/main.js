//Global Methods Declaration
const roomCode = document.getElementById('roomCode').innerHTML
const admin = document.getElementById('admin').innerHTML
var playCorner = document.getElementById('playCorner');
if(admin=='true'){
  document.getElementById('start').disabled = true;
  document.getElementById('end').style.visibility = 'hidden';
}
document.getElementById('player1detail').style.visibility = 'hidden'
document.getElementById('player2detail').style.visibility = 'hidden'
document.getElementById('player3detail').style.visibility = 'hidden'
document.getElementById('player4detail').style.visibility = 'hidden'
//Glabal Variables
var turn,username,myrank,count = 0,totalCards=0,cardsCount = 0,unique = 0,expectedCards,hukam='',currentMax={},mindisuit=[];
var player1,player2,mindi=false;
var playerNames = [];
var counterSuit = [];
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
  if(admin=='true' && playerList.length==4){
    document.getElementById('start').disabled = false;
  }
  if(admin == 'true' && playerList.length !=4){
    document.getElementById('start').disabled = true;
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

  document.getElementById('start').style.visibility = 'hidden'
  if(admin=='true')
  {
    document.getElementById('end').style.visibility = 'visible';
  }
  socket.emit('showUI');
  socket.emit('start',13);
}

//This method will be called whenever cards are received.
socket.on('sendData',(data,e)=>{
  expectedCards = e;

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
              if(check[checkIndex]!=suit[suitIndex] ){
                if(counterSuit[check[checkIndex]] != 0){
                  return;
                }else{
                  if(hukam=='')
                    socket.emit('hukam',suit[suitIndex]);
                }
              }
            }
            counterSuit[suit[suitIndex]]--;

            _td.style.visibility='hidden'
            turn = playerNames[(myrank+1)%(playerNames.length)];
            socket.emit('turn',turn,false);
            socket.emit('card',_td.src,username);
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

  swal.fire({
    title: 'Select Player for turn',
    input: 'radio',
    inputOptions: playerNames,
    allowOutsideClick: false,
    inputValidator: function(result) {
      return new Promise(function(resolve, reject) {
        if (result) {
          resolve();
        } else {
          reject('You need to select something!');
        }
      });
    }
  }).then(function(result) {
    turn = playerNames[result.value];
    socket.emit('turn',turn,true)
  })

}


//Highlight player with the turn
socket.on('msg',(data,toast)=>{
  turn = data;
  if(toast){
    document.getElementById('snackbar').innerHTML = turn +'\'s Turn';
    showToast();
  }
  var name = document.getElementById(turn);
  for(i=0;i<playerNames.length;++i){
    document.getElementById(playerNames[i]).style.border = "none";
    if(document.getElementById('player'+(i+1)).innerHTML == turn){
      document.getElementById('player'+(i+1)+'img').style.border = "thick solid #0000FF";
    }
    else
      document.getElementById('player'+(i+1)+'img').style.border = "none";
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
  if(admin=='true'){
    let suit = (data.data).split("/").pop().split(".")[0];
    let suitindex = suit.length -1;
    if(suit.length==3){
      mindi = true;
      mindisuit.push(suit[suitindex]);
    }
    if(count==1){
      currentMax["player"] = data.username;
      currentMax["cardSuit"] = suit[suitindex];
      currentMax["card"] = getWeight(suit);
      currentMax["hukam"] =  (currentMax["cardSuit"]==hukam) ? true : false;
    }
    else{
      if(currentMax["hukam"] == true && suit[suitindex]==hukam && currentMax["card"]<getWeight(suit)){
        currentMax["player"] = data.username;
        currentMax["cardSuit"] = suit[suitindex];
        currentMax["card"] = getWeight(suit);
        currentMax["hukam"] =  true;
      }
      else if(currentMax["hukam"] == false && suit[suitindex]==hukam){
        currentMax["player"] = data.username;
        currentMax["cardSuit"] = suit[suitindex];
        currentMax["card"] = getWeight(suit);
        currentMax["hukam"] =  true;
      }
      else if(currentMax["hukam"] == false && suit[suitindex]!=hukam && currentMax["card"]<getWeight(suit)){
        currentMax["player"] = data.username;
        currentMax["cardSuit"] = suit[suitindex];
        currentMax["card"] = getWeight(suit);
        currentMax["hukam"] =  false;
      }

    }
  }
  if(count == data.maxCount){
    count = 0;
    turn = "";
    for(i=0;i<playerNames.length;++i){
      document.getElementById(playerNames[i]).style.border = "none";
    }

    setTimeout(doit,2000);
  }
})

function getWeight(suit){
  if(suit.length==3)
    return 10;
  else if(suit[0]=='A')
    return 14;
  else if(suit[0]=='K')
    return 13;
  else if(suit[0]=='Q')
    return 12;
  else if(suit[0]=='J')
    return 11;
  else
    return parseInt(suit[0]);
}

//Clears the table
socket.on('clearBoard',()=>{
  while (playCorner.hasChildNodes())
    playCorner.removeChild(playCorner.firstChild);
})

//Asking user for next turn
function doit(){
  --totalCards;
  count = 0;
  if(admin=='true'){
    if(mindi){
      document.getElementById('add'+currentMax.player).value = 1 + parseInt(10*mindisuit.length);
      socket.emit('mindiHighlight',mindisuit);
    }
    else
      document.getElementById('add'+currentMax.player).value = 1;
    send();
  }
  
  document.getElementById('add'+currentMax.player).value = '';
  if(totalCards == 0){
    socket.emit('clearAll');
    return;
  }
  socket.emit('clear');
  
  mindi=false;
  mindisuit = [];
  turn = "";
  if(admin == "true")
    checkTurn();
  currentMax = {};
}

function checkTurn(){
  turn = currentMax.player;
  socket.emit('turn',turn,true)
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
  hukam ='';
  cards = {
    'S':[],
    'D':[],
    'C':[],
    'H':[]
  }
  document.getElementById('player1detail').style.visibility = 'hidden'
  document.getElementById('player2detail').style.visibility = 'hidden'
  document.getElementById('player3detail').style.visibility = 'hidden'
  document.getElementById('player4detail').style.visibility = 'hidden'
  document.getElementById('S10').style.opacity = 0.5;
  document.getElementById('S10').style.border = "1px solid black";
  document.getElementById('H10').style.opacity = 0.5;
  document.getElementById('H10').style.border = "1px solid black";
  document.getElementById('C10').style.opacity = 0.5;
  document.getElementById('C10').style.border = "1px solid black";
  document.getElementById('D10').style.opacity = 0.5;
  document.getElementById('D10').style.border = "1px solid black";
  document.getElementById('hukam').src = '/images/NA.png';


  if(admin=='true'){
    document.getElementById('start').style.visibility = 'visible'
    document.getElementById('end').style.visibility = 'hidden';
  }
  if(playerNames.length==4){
    var mindiA=0,mindiB=0,handsA=0,handsB=0;
    handsA = document.getElementById('score'+playerNames[0]).innerHTML%10 + document.getElementById('score'+playerNames[2]).innerHTML%10
    handsB = document.getElementById('score'+playerNames[1]).innerHTML%10 + document.getElementById('score'+playerNames[3]).innerHTML%10
    mindiA = Math.floor(document.getElementById('score'+playerNames[0]).innerHTML/10) + Math.floor(document.getElementById('score'+playerNames[2]).innerHTML/10)
    mindiB = Math.floor(document.getElementById('score'+playerNames[1]).innerHTML/10) + Math.floor(document.getElementById('score'+playerNames[3]).innerHTML/10)
    
    if(mindiA+mindiB<=2){
      Swal.fire({
        title: 'Scores!',
        html: "Game is Tie!",
      })
    }
    else if(mindiA+mindiB == 3){
      
      if(mindiA==3){
        Swal.fire({
          title: playerNames[0] + ' and ' + playerNames[2] + ' wins!',
          html: "Miss the chance for the Coat.",
        })
      }else if(mindiB==3){
        Swal.fire({
          title: playerNames[1] + ' and ' + playerNames[3] + ' wins!',
          html: "Miss the chance for the Coat.",
        })
      }else{
        Swal.fire({
          title: 'Scores!',
          html: "Game is Tie!",
        })
      }
    }
    else{
      if(mindiA == 3 && mindiB==1){
        Swal.fire({
          title: playerNames[0] + ' and ' + playerNames[2] + ' wins!',
          html: "Total Mindi Collected by team A is "+mindiA+"<br>"+"Total Mindi Collected by team B is "+mindiB+"<br>",
        })
      }
      if(mindiA == 1 && mindiB==3){
        Swal.fire({
          title: playerNames[1] + ' and ' + playerNames[3] + ' wins!',
          html: "Total Mindi Collected by team A is "+mindiA+"<br>"+"Total Mindi Collected by team B is "+mindiB+"<br>",
        })
      }
      if(mindiA == 4){
        Swal.fire({
          title: playerNames[0] + ' and ' + playerNames[2] + ' wins!',
          html: "Bingo !!!! Team A has scored perfect 4 mindi against opponenet team",
        })
      }
      if(mindiB == 4){
        Swal.fire({
          title: playerNames[1] + ' and ' + playerNames[3] + ' wins!',
          html: "Bingo !!!! Team A has scored perfect 4 mindi against opponenet team",
        })
      }
      if(mindiA == 2 && mindiB==2 && handsA>handsB){
        Swal.fire({
          title: playerNames[0] + ' and ' + playerNames[2] + ' wins!',
          html: "Oh that was close. Both Team with same mindi! <br> Total Hands by Team A : "+handsA+"<br>"+ "Total Hands by Team B : "+handsB+"<br>",
        })
      }
      if(mindiA==2 && mindiB==2 && handsA<handsB){
        Swal.fire({
          title: playerNames[1] + ' and ' + playerNames[3] + ' wins!',
          html: "Oh that was close. Both Team with same mindi! <br> Total Hands by Team A : "+handsA+"<br>"+ "Total Hands by Team B : "+handsB+"<br>",
        })
      }
    }
  }
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

socket.on('hukamShow',(data)=>{
  hukam = data;
  var s;
  if(hukam=='H')
    s = 'hearts.png'
  if(hukam=='S')
    s = 'spades.png'
  if(hukam=='C')
    s = 'club.png'
  if(hukam=='D')
    s = 'diamond.png'
  document.getElementById('hukam').src = '/images/'+s;
})

function endGame(){
  socket.emit('clearAll');
}

function showToast(){
  var x = document.getElementById('snackbar');
  x.className = "show";
  setTimeout(function(){
    x.className = x.className.replace('show','');
  },3000);
}

socket.on('getUI',()=>{
  for(i=0;i<playerNames.length;++i){
    if(playerNames[i]==username)
      break;
  }
  for(j=1;j<=playerNames.length;++j){
    document.getElementById('player'+j).innerHTML = playerNames[i];
    document.getElementById('player'+j+'detail').style.visibility = 'visible';
    i= (++i)%playerNames.length;
  }
})

socket.on('mindiAccepted',data=>{
  for(i=0;i<data.length;++i){
    document.getElementById(data[i]+'10').style.opacity = 1;
    document.getElementById(data[i]+'10').style.border = "thick solid green";
  }
})

socket.on('firstTurn',(card1,card2)=>{
  var s;
  if(card1.weight>card2.weight){
    s = "Team A will start the game"
    turn = playerNames[0];
  }
  else{
    turn = playerNames[1];
    s = "TeamB will start the game"
  }
  swal.fire({
    title: s,
    html:"<div class=row><div class=col my-auto><img src='/images/"+card1.name+"' height=\"200px\" width=\"150px\"></div><div class=col my-auto><img src='/images/"+card2.name+"' height=\"200px\" width=\"150px\"></div></div>  <br> <div class=row><div class=col my-auto>Team A</div><div class=col my-auto>Team B</div></div>",
  });
  
  socket.emit('turn',turn,true)
})