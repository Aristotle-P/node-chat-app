const socket = io();

// Declaring form elements for ease of access
const chatForm = document.querySelector('#chat-form');
const chatBox = chatForm.querySelector('input');
const chatBtn = chatForm.querySelector('button');
const locationBtn = document.querySelector('#send-location');
const messages = document.querySelector('#messages');

// Declaring message templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  const newMessage = messages.lastElementChild;

  // Height of newest message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // Height of visible screen real estate
  const visibleHeight = messages.offsetHeight;

  // Height of full messages container
  const containerHeight = messages.scrollHeight;

  // Screen scrolling location
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on('message', message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', message => {
  console.log(message);
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    location: message.url,
    createdAt: moment(message.createdAt).format('h:mm A')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector('#sidebar').innerHTML = html;
});

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  // chatBtn.setAttribute('disabled', 'disabled');
  const text = e.target.elements.chatBox.value;
  socket.emit('sendMessage', text, error => {
    // chatBtn.removeAttribute('disabled');
    if (error) {
      return console.log(error);
    }
    console.log('Message delivered!');
  });
  chatBox.value = '';
});

locationBtn.addEventListener('click', e => {
  locationBtn.setAttribute('disabled', 'disabled');
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      {
        lat: position.coords.latitude,
        long: position.coords.longitude
      },
      () => {
        locationBtn.removeAttribute('disabled');
        console.log('Location shared!');
      }
    );
  });
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
