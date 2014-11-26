// io = chrome.extension.getBackgroundPage().io;
var storage = chrome.storage.sync;
var ID;
var storageKey = "miniBUser";
var serverAddress = 'https://minib-app.herokuapp.com/';
storage.get(storageKey, function(data){
  if( data[storageKey] !== undefined ){
    ID = JSON.parse(data[storageKey]).id;
    showContent();
    connect();
  }else{
    showLogin();
  }
});

function showLogin(){
  $('#login-form').show();
}
function saveUser(){
  storage.set({"miniBUser": JSON.stringify({'id' : ID})}, function(response){
    console.log(response);
  });
}
function showContent(){
  $('#content').fadeIn("fast");
}
function showMsg(err){
  if(err.type == 1){
    $('#msg-container').show();
    $('#msg-container').text(err.msg);
  }else{
    $('#msg-download-container').show()
  }
}
function connect(){
  var socket = io.connect(serverAddress, {port: ''});
  var startTVButton = document.getElementById("start-tv-btn");

  // socket.on('connect', function(){
  //   socket.emit('login', {
  //     id: ID,
  //     type: 'controller'
  //   });
  //   startTVButton.removeAttribute('disabled');
  // });
  socket.on('start_tv_error', function(err){
    showMsg(err);
  });
  startTVButton.addEventListener('click', function(){
    chrome.tabs.getSelected(null, function(tab) {
      socket.emit('start_tv', {
        id: ID,
        message: {
          url: tab.url,
          title: tab.title
        }
      });
    });  
  });
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
      url: serverAddress + 'api/register',
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
      url: serverAddress + 'api/sign-in',
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
    })
  });
});