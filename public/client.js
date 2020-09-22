$(document).ready(function () {

  let socket = io();
  
  socket.on('user', (data)=>{
    $('#num-users').text(data.currentUsers + 'Users are online');
    let message = data.connected? data.user + "Joined the chat" : data.user + "Left the chat"
  })

    // Form submittion with new message in field with id 'm'
    $('form').submit(function () {
        var messageToSend = $('#m').val();
        //send message to server here?
        $('#m').val('');
        return false; // prevent form submit from refreshing page
    });


 
});


