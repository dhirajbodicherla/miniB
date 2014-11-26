var gui = require('nw.gui');
gui.Screen.Init();
var screens = gui.Screen.screens;
win = gui.Window.get();
var clipboard = gui.Clipboard.get();

var listOfTVs, socket, tray, noTVsItem, ID;

var x = 0, y =  screens[0].bounds.height - screens[0].work_area.height;
var tvHeight = Math.floor(screens[0].work_area.height / 2);
var tvWidth = Math.floor(screens[0].bounds.width/2);

if(localStorage.getItem('miniBUser') != null){
  ID = localStorage.getItem('miniBUser');
  showContent();
  connect();
}else{
  showLogin();
}

function saveUser(){
  localStorage.setItem('miniBUser', ID);
}
function showContent(){
  win.hide();
  win.setShowInTaskbar(false);
}
function showLogin(){
  win.show();
  win.setShowInTaskbar(true);
  this.win.moveTo(x + tvWidth/2, y + tvHeight/2);
  this.win.resizeTo(tvWidth, tvHeight);
}
function connect(){

  tray = new gui.Tray({
      icon: 'images/trayicon-16x16.png'
  });

  listOfTVs = [];
  socket = io.connect('https://minib-app-c9-dhirajbodicherla.c9.io/', {port: ''});
  socket.on('connect', function(){
    socket.emit('login', {
      id: ID,
      type: 'tv'
    });
  });
  socket.on('start_tv', function(data){
    if(listOfTVs.length > 4) return;
    
    listOfTVs.push(new TV(data));
    updateTray();
  });
  
  tray.menu = new gui.Menu();

  noTVsItem = new gui.MenuItem({
      label: 'No TV\'s yet',
      enabled: false
  });
  tray.menu.append(noTVsItem);
  
  tray.menu.append(new gui.MenuItem({
    type: 'separator'
  }));
  tray.menu.append(new gui.MenuItem({
    label: 'Quit',
    click: function(){
      gui.App.quit();
    }
  }));
}

function TV(data){
  var self = this;
  this.win = gui.Window.open(data.url,{
    "toolbar": false,
    "frame": false,
  });
  this.item = new gui.MenuItem({
      label: data.url,
      title: data.title,
      click: function () {
          self.win.close();
          tray.menu.remove(self.item);
          _.remove(listOfTVs, function(fn){ return fn === self; });
          updateTray();
      }
  });
  tray.menu.append(this.item);
  this.win.resizeTo(tvWidth, tvHeight);
  /*
   * @check_later
   * can improve this A LOT
   */
  var tvsLength = parseInt(listOfTVs.length,10);
  if(tvsLength === 0){
    this.win.moveTo(x, y);
  }else if(tvsLength === 1){
    this.win.moveTo(x, y + tvHeight);
  }else if(tvsLength === 2){
    this.win.moveTo(x + tvWidth, y);
  }else{
    this.win.moveTo(x + tvWidth, y + tvHeight);
  }
  return this;
}
function updateTray(){
  if(listOfTVs.length == 0){
    tray.menu.insert(noTVsItem, 0);
  }else{
    tray.menu.remove(noTVsItem);
  }
}

$(document).ready(function(){
  $('#register-link').click(function(e){
    e.preventDefault();

    $('#login-form').fadeOut('fast', function(){
      $('#register-form').fadeIn();
    });
  });
  $('#cancel-register').click(function(e){
    e.preventDefault();

    $('#register-form').fadeOut('fast', function(){
      $('#login-form').fadeIn();
    });
  });

  $('#register-form').submit(function(e){
    e.preventDefault();
    var self = this;
    var formData = {
      userEmail: $('#email-register').val(),
      userPassword: $('#password-register').val()
    };
    $.ajax({
      type: 'POST',
      url: 'https://minib-app-dhirajbodicherla.c9.io/api/register',
      data: JSON.stringify(formData),
      dataType: 'JSON',
      success: function(result){
        if(result){
          $(self).fadeOut();
          ID = result.id;
          saveUser();
          showContent();
          connect();
        }
      },
      error: function(){
        alert('please try again');
      }
    })
  });

  $('#login-form').submit(function(e){
    e.preventDefault();
    var self = this;
    var formData = {
      userEmail: $('#email-login').val(),
      userPassword: $('#password-login').val()
    };
    $.ajax({
      type: 'POST',
      url: 'https://minib-app-dhirajbodicherla.c9.io/api/sign-in',
      data: JSON.stringify(formData),
      dataType: 'JSON',
      success: function(result){
        if(result){
          $(self).fadeOut();
          ID = result.id;
          saveUser();
          showContent();
          connect();
        }
      },
      error: function(){
        console.log('error');
      }
    });
  });
});