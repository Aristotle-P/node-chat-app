const socket = io();

socket.on('message', welcome => {
  console.log(welcome);
});

document.querySelector('#chat-form').addEventListener('submit', e => {
  e.preventDefault();
  const text = e.target.elements.chatBox.value;
  socket.emit('sendMessage', text);
  e.target.elements.chatBox.value = '';
});

document.querySelector('#send-location').addEventListener('click', e => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit('sendLocation', {
      lat: position.coords.latitude,
      long: position.coords.longitude
    });
  });
});
