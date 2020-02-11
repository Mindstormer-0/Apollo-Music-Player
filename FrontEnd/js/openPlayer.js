/* Notes:
Boot gets built-list and then calls boot2.
Uses Bootstrap4.
  Bootstrap colors:
  bg-primary(blue)
  bg-secondary(grey)
  bg-success(green)
  bg-danger(red)
  bg-warning(orange)
  bg-info(turquoise)
  bg-light(off-white)
  bg-dark(dark-grey)
  bg-white(white)
*/

var objList = {"artist": "none", "album": "none", "title": "none", "duration": "none", "elapsed": "none", "pic": "none", "palette": [[35, 47, 53], [191, 170, 157], [128, 151, 162]]}
var liveDuration = {"duration": 0, "elapsed": 0};
var mpdStatus = {"state": "pause"};
var checkSystemStatus = false;

function boot(){
  nullInfo();
  fetchAllSongs();
}

function boot2(){
  heartbeat();
  checkPlayUIStatus();
  currentlyPlaying();
  setInterval(function() {heartbeat()}, 500);
  setInterval(function() {progressTime()}, 99);
  setInterval(function() {progressBar(liveDuration)}, 100);
  addAlbums();
  addPlaylists();
  addArtists();
  generateLibrary();
}

function nullInfo() {
  document.getElementById('currentAlbum').setAttribute('src', "./images/AlbumArt-01.png");
  document.getElementById('returnCurrentSong').innerHTML = 'none';
  document.getElementById('returnCurrentArtist').innerHTML = 'none';
  document.getElementById('returnCurrentDuration').innerHTML = '0:00';
  document.getElementById('returnCurrentElapsed').innerHTML = '0:00';
}

function heartbeat() {
  fetch('http://localhost:5000/api/heartbeat', {method: 'GET', mode: 'cors'})
  .then(function(response) {
    return response.json();
  })
  .then(function (obj) {
    mpdStatus = obj;
    //console.log(mpdStatus.state);
    delete obj;
  });
}

function openSearch() {
 if (document.getElementById("mainSearch").style.display = "none"){
  document.getElementById("mainSearch").style.display = "block";
  document.getElementById("mainPlaylists").style.display = "none";
  document.getElementById("mainArtists").style.display = "none";
  document.getElementById("mainAlbums").style.display = "none";
 }
}

function go2Playlists(){
  if (document.getElementById("mainPlaylists").style.display = "none"){
  document.getElementById("mainPlaylists").style.display = "block";
  document.getElementById("mainArtists").style.display = "none";
  document.getElementById("mainAlbums").style.display = "none";
  document.getElementById("mainSearch").style.display = "none";
  }
}
function go2Albums(){
  if (document.getElementById("mainAlbums").style.display = "none"){
  document.getElementById("mainAlbums").style.display = "block";
  document.getElementById("mainPlaylists").style.display = "none"
  document.getElementById("mainArtists").style.display = "none"
  document.getElementById("mainSearch").style.display = "none"
  }
}
function go2Artists(){
  if (document.getElementById("mainArtists").style.display = "none"){
  document.getElementById("mainArtists").style.display = "block";
  document.getElementById("mainPlaylists").style.display = "none";
  document.getElementById("mainAlbums").style.display = "none";
  document.getElementById("mainSearch").style.display = "none";
  }
}

function current() {
  if (document.getElementById("currentCue").style.display = "none"){
   document.getElementById("currentCue").style.display = "block";
  }
}

function closeCurrent() {
  if (document.getElementById("currentCue").style.display = "block"){
   document.getElementById("currentCue").style.display = "none";
  }
}

function shuffle() {
  var x = document.getElementById("shuffle");
  if (x.style.color === "white") {
    x.style.color = "#f7931E";
     /* shuffle on*/
  } else {
    x.style.color = "white";
     /* shuffle off*/
  }
}

function repeatSong() {
    var j = fetch('http://localhost:5000/api/repeatSong', { method: 'POST', mode: 'cors' });
    j.then(function (response) { //fask should have printed 
        return response.text();
    }).then(function (text) {
        console.log('POST response: ');
        console.log(text);
    });

    var x = document.getElementById("rewind");
    var y = document.getElementById("rewindSong");
    if (x.style.display === "inline") {
        x.style.display = "none";
        y.style.display = "inline";
        /* repeat song on*/
    } else {
        x.style.color = "white";
        x.style.display = "inline";
        y.style.display = "none";
        /* repeat off*/
    }
}

function repeat() {
    var j = fetch('http://localhost:5000/api/repeat', { method: 'POST', mode: 'cors' });
    j.then(function (response) { //fask should have printed 
        return response.text();
    }).then(function (text) {
        console.log('POST response: ');
        console.log(text);
    });

    var x = document.getElementById("rewind");
    if (x.style.color === "white") {
        x.style.color = "#f7931E";
        /* repeat playlist on*/
    } else {
        x.style.color = "white";
        /* repeat off*/
    }
}

function repeatoff() {
    var j = fetch('http://localhost:5000/api/repeatoff', { method: 'POST', mode: 'cors' });
    j.then(function (response) { //fask should have printed 
        return response.text();
    }).then(function (text) {
        console.log('POST response: ');
        console.log(text);
    });

    var x = document.getElementById("rewind");
    var y = document.getElementById("rewindSong");

    if (y.style.display === "inline" || x.style.color === "#f7931E") {
        x.style.color = "white";
        x.style.display = "inline";
        y.style.display = "none";
        /* repeat song off*/
    }
}

function fetchAllSongs() {
  fetch('http://localhost:5000/api/obj_list', {method: 'GET', mode: 'cors'})
  .then(function(response) {
    return response.json();
    }).then(function (obj) {
    //console.log('POST response: ');
    objList = obj;
    //console.log(objList);
    boot2();
  });
}

function generateLibrary() {
  var library = [];
  library = objList.songs;
  var songList = document.getElementById("libraryBody");
  for (var i = 0; i < library.length; i++) {
    var song = document.createElement("tr");
    song.setAttribute("id", library[i].id);
    song.setAttribute("class", "libraryRow");
    addRowHandlers();
      var cell = document.createElement("td");
      var songName = document.createTextNode(library[i].title);
      cell.appendChild(songName);
      song.appendChild(cell);

      cell = document.createElement("td");
      var artistName = document.createTextNode(library[i].artist);
      cell.appendChild(artistName);
      song.appendChild(cell);


      cell = document.createElement("td");
      var albumName = document.createTextNode(library[i].album);
      cell.appendChild(albumName);
      song.appendChild(cell);


      cell = document.createElement("td");
      songLength = library[i].duration;
      minutes = (songLength/60);
      minutes = minutes.toFixed(2);
      var duration = document.createTextNode(minutes);
      cell.appendChild(duration);
      song.appendChild(cell);

    songList.appendChild(song);
  }
}

function addRowHandlers() {
  var table = document.getElementById("libraryTable");
  var rows = table.getElementsByTagName("tr");
  for (i = 0; i < rows.length; i++) {
      var currentRow = table.rows[i];
      var createClickHandler = function(row) 
          {
              return function() { 
                  var id = row.id;
                  idSendPlay(id)
                  setTimeout(function() {currentlyPlaying()}, 100);
                               };
          };
      currentRow.onclick = createClickHandler(currentRow);
  }
}

function idSendPlay(val) {var asJSON = JSON.stringify({'id':val});fetch('http://localhost:5000/api/play_selected', {
  method: 'POST',
  mode: "cors",
  body: asJSON,
  headers:{"Content-Type": 'application/json'}
  }).then(function(response){
    return response.text();
  }).then(function(text){
  });
}

function addAlbums() { 
  var library = [];
  library = objList.albums;
  for(var i = 0; i < library.length; i++){
     if ((library[i].pic == null) || (library[i].pic == "none")){
        var img = document.createElement('img');
        img.setAttribute("src", "./images/AlbumArt-01.png");
        img.classList.add("square");
        img.classList.add("albumType");
        img.setAttribute("id", library[i].pic);
        document.getElementById("mainAlbums").append(img);
    }
    else 
    {
      var img = document.createElement('img');
      img.setAttribute("src" , library[i].pic);
      img.classList.add("square");
      img.classList.add("albumType");
      img.setAttribute("id" , library[i].pic);
      document.getElementById("mainAlbums").append(img);
      //console.log(img);
    }
  }
  albumButtons();
}

function albumButtons(){
  var library = [];
  library = objList.albums;
  for(var i = 0; i < library.length; i++){
    if (library[i].pic == "./images/Logo1.png"){
      continue;
    }
    else 
    {
    document.getElementById(library[i].pic).setAttribute('onclick' ,function changePlaying() {
      document.getElementById('currentAlbum').src=library[i];
    });
  }
}
}

function addPlaylists() { 
      var img = document.createElement('img');
      img.setAttribute('onclick', function newPlaylist(){
        document.getElementById("mainPlaylist").append(img);
      });
      img.src = "https://cdn.pixabay.com/photo/2018/11/13/21/43/instagram-3814051_1280.png"
      img.classList.add("square");
      img.setAttribute("onclick" , "current()")
      document.getElementById("mainPlaylists").append(img);
}

function addArtists() { 
  var library = [];
  library = objList.artists;
  let artistSet = new Set();
  var artistTable = document.createElement('table');
  artistTable.classList.add("artistDisplay");

  for (var i=0; i < library.length; i++){
    artistSet.add(library[i].name);
  };

  let artistArray = Array.from(artistSet);
  artistArray.sort();
  for(var i =0; i<artistArray.length; i++){

    var row = document.createElement("tr");

    var artistName = document.createElement("td");
    var artist = document.createTextNode(artistArray[i]);
    artistName.append(artist);
    row.append(artistName);
    row.setAttribute("id" , "artist-" + artistArray[i]);
    artistTable.append(row);
  } 

  document.getElementById("mainArtists").append(artistTable);
}

function togglePlaying()
{
  document.getElementById("pause").style.display = "inline";
  document.getElementById("play").style.display = "none";
  
  var j =fetch('http://localhost:5000/api/play', {method: 'POST', mode: 'cors'});
    j.then(function(response) { //fask should have printed 
    return response.text();
    }).then(function (text) {
    currentlyPlaying();
    //console.log('POST response: ');
    //console.log(text);
  });
}

function toggleStopped()
{
    
  document.getElementById("pause").style.display = "none";
  document.getElementById("play").style.display = "inline";

  fetch('http://localhost:5000/api/play', {method: 'POST', mode: 'cors'}).then(function(response) {
    //console.log(response);
  });
}

function nextSong()
{
  fetch('http://localhost:5000/api/next', {method: 'GET', mode: 'cors'}).then(function(response) {
  return response.text();
  }).then(function (text) {
  currentlyPlaying();
  //console.log('POST response: ');
  //console.log(text);
  });
}

function prevSong()
{
  fetch('http://localhost:5000/api/previous', {method: 'GET', mode: 'cors'}).then(function(response) { 
  return response.text();
  }).then(function (text) {
    currentlyPlaying();
    //console.log('GET response: ');
    //console.log(text);
  });
}

function SetVolume(val) 
{
  var player = document.getElementById('myRange');
  //console.log('Before: ' + player.volume);
  player.volume = val;
  //console.log('After: ' + player.volume);

  var asJSON = JSON.stringify({'volume':val});
  //console.log(asJSON)

  //POST
  fetch('http://localhost:5000/api/volume', {
            method: 'POST',
            mode: "cors",
            body: asJSON,
            headers:{
                "Content-Type": 'application/json'
            }
  }).then(function(response){
    return response.text();
  }).then(function(text){
    //console.log('POST reponse: ');

    //console.log(text);
  });
}

function shuffle()
{
    var j = fetch('http://localhost:5000/api/shuffle', { method: 'POST', mode: 'cors' });
    j.then(function (response) { //fask should have printed 
        return response.text();
    }).then(function (text) {
        currentlyPlaying();
        //console.log('POST response: ');
        //console.log(text);
    });
}

function currentlyPlaying() {
  fetch('http://localhost:5000/api/get_current', {method: 'GET', mode: 'cors'})
  .then(function(response) {
    return response.json();
    })
    .then(function (obj) {
    //console.log(obj);
    //console.log(obj.palette[0]);
    //console.log(mpdStatus.state);
    var r = obj.palette[0][0];
    var g = obj.palette[0][1];
    var b = obj.palette[0][2];
    var r2 = obj.palette[1][0];
    var g2 = obj.palette[1][1];
    var b2 = obj.palette[1][2];
    document.getElementById('currentlyPlaying').style.backgroundImage = 'linear-gradient(to bottom, rgba('+r+','+g+','+b+','+1+'), rgba('+r2+','+g2+','+b2+','+0+'))';
    if (obj.pic == '' || obj.pic == null || obj.pic == 'none') {
      document.getElementById('currentAlbum').setAttribute('src', "./images/AlbumArt-01.png");
    }
    else {
      document.getElementById('currentAlbum').setAttribute('src', obj.pic);
    }
    document.getElementById('returnCurrentSong').innerHTML = obj.title;
    document.getElementById('returnCurrentArtist').innerHTML = obj.artist;
    document.getElementById('returnCurrentDuration').innerHTML = secondsTo_MMSS(obj.duration);
    liveDuration.duration = obj.duration;
    liveDuration.elapsed = obj.elapsed;
    checkPlayUIStatus();
    var callself = parseInt(obj.duration);
    callself = (callself * 1000) - 100;
    if (parseInt(obj.elapsed) >= parseInt(obj.duration)){
      currentlyPlaying();
    }
    setTimeout(function() {currentlyPlaying()}, callself);
    delete obj;
  });
}

function checkPlayUIStatus() {
  if (mpdStatus.state == 'play') {
    document.getElementById("pause").style.display = "inline";
    document.getElementById("play").style.display = "none";
  }
  else {
  document.getElementById("pause").style.display = "none";
  document.getElementById("play").style.display = "inline";
  }
  document.getElementById('returnCurrentElapsed').innerHTML = secondsTo_MMSS(liveDuration.elapsed);
}

function progressTime() {
  checkSystemStatus = false;
  if (mpdStatus.state == 'play') {
    const tick = 0.100;
    var elapsed = parseFloat(liveDuration.elapsed);
    liveDuration.elapsed = elapsed + tick;
    document.getElementById('returnCurrentElapsed').innerHTML = secondsTo_MMSS(liveDuration.elapsed);
  }
  if (liveDuration.elapsed >= liveDuration.duration) {
    //checkSystemStatus = true;
  }
  return 0;
}

function progressBar(obj) {
  var bar = document.getElementById("progBar");
  barPercent = (obj.elapsed / obj.duration) * 100;
  bar.style.width = String(barPercent) + '%';
  if (mpdStatus.state == 'play'){
    document.getElementById('progBar').setAttribute('class', "progress-bar progress-bar-striped progress-bar-animated bg-dark");
  }
  else {
    document.getElementById('progBar').setAttribute('class', "progress-bar progress-bar-striped bg-dark");
  }
  return 0;
}

function secondsTo_MMSS(seconds) {
  function toFixed(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
  } 
  var fSec = parseInt(seconds);
  var durMin = fSec / 60;
  var durSec = fSec % 60;
  durMin = toFixed(durMin, 0);
  durSec = toFixed(durSec, 0);
  function pad(value) {
    if(value < 10) {
        return '0' + value;
    } else {
        return value;
    }
  }
  //durMin = pad(durMin);
  durSec = pad(durSec);
  return durMin + ':' + durSec;
}

/* This is for the future seek scrubber
function returnMouseEventRelPos() {
  // e = Mouse click event.
  var rect = document.getElementById("progBar").getBoundingClientRect();
  var x = document.getElementById("progBar").clientX - rect.left; //x position within the element.
  var y = document.getElementById("progBar").clientY - rect.top;  //y position within the element.
  return x;
}


function seekTo(time) {
  fetch('http://localhost:5000/api/seek', {method: 'POST', mode: "cors", body: time, headers:{"Content-Type": 'application/json'}
  }).then(function(response){
    return response.text();
  }).then(function(text){
    //console.log('POST reponse: ');
    //console.log(text);
  });
}
*/