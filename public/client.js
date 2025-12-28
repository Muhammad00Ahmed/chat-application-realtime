const socket = io();
let username = '';

function joinChat() {
  const input = document.getElementById('username-input');
  username = input.value.trim();
  
  if (!username) {
    alert('Please enter a username');
    return;
  }
  
  socket.emit('join', username);
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('chat-screen').style.display = 'flex';
  document.getElementById('message-input').focus();
}

function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  socket.emit('message', { message });
  input.value = '';
}

function addMessage(data) {
  const messagesDiv = document.getElementById('messages');
  const messageEl = document.createElement('div');
  messageEl.className = 'message';
  
  if (data.username === username) {
    messageEl.classList.add('own-message');
  }
  
  messageEl.innerHTML = `
    <div class="message-header">
      <strong>${data.username}</strong>
      <span class="timestamp">${new Date(data.timestamp).toLocaleTimeString()}</span>
    </div>
    <div class="message-content">${data.message}</div>
  `;
  
  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Socket event listeners
socket.on('message', addMessage);

socket.on('user-joined', (data) => {
  const messagesDiv = document.getElementById('messages');
  const systemMsg = document.createElement('div');
  systemMsg.className = 'system-message';
  systemMsg.textContent = `${data.username} joined the chat`;
  messagesDiv.appendChild(systemMsg);
});

socket.on('user-left', (data) => {
  const messagesDiv = document.getElementById('messages');
  const systemMsg = document.createElement('div');
  systemMsg.className = 'system-message';
  systemMsg.textContent = `${data.username} left the chat`;
  messagesDiv.appendChild(systemMsg);
});

socket.on('user-typing', (username) => {
  const indicator = document.getElementById('typing-indicator');
  indicator.textContent = `${username} is typing...`;
  setTimeout(() => {
    indicator.textContent = '';
  }, 3000);
});

// Typing indicator
let typingTimeout;
document.getElementById('message-input').addEventListener('input', () => {
  socket.emit('typing');
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stop-typing');
  }, 1000);
});

// Send on Enter
document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});