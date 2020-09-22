$(document).ready(function() {
  let socket = io();

  socket.on("user", data => {
    $("#num-users").text(data.currentUsers + " User(s) are online");
    let message = data.user + (data.connected ? " Joined the chat" : " Left the chat");
    $("#messages").append($("<li>").html("<br>" + message + "</br>"));
  });
  
  // socket.on('chat message', (data) =>{
  //   console.log('2nt')
    // $('#messages').append($("<li>").html("<br>"+ data.name+": "+ data.message)+"/<br>")
  // });
  
  socket.on('chat message', (data) => {
    console.log('socket.on 1');
    $('#messages').append($('<li>').text(`${data.name}: ${data.message}`));
  });

  // Form submittion with new message in field with id 'm'
  $("form").submit(function() {
    var messageToSend = $("#m").val();
    //send message to server here?
    socket.emit('chat message', messageToSend)
    $("#m").val("");
    return false; // prevent form submit from refreshing page
  });
  
  
});
