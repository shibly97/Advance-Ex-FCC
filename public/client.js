$(document).ready(function() {
  let socket = io();

  socket.on("user", data => {
    $("#num-users").text(data.currentUsers + " User(s) are online");
    let message = data.user + (data.connected ? " Joined the chat" : " Left the chat");
    $("#messages").append($("<li>").html("<br>" + message + "</br>"));
  });

  // Form submittion with new message in field with id 'm'
  $("form").submit(function() {
    var messageToSend = $("#m").val();
    //send message to server here?
    socket.emit('chat message', messageToSend)
    $("#m").val("");
    return false; // prevent form submit from refreshing page
  });
  
  io.on('chat message', message)
});
