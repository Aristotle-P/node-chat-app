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
