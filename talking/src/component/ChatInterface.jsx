import React, { useState, useEffect } from 'react';
import "./ChatInterface.css"

const API_KEY = 'wys_YMaL6zUeqo1JTogaaPEO1X9cSnzNdW3wNNZG';
const API_BASE_URL = 'https://ad6eac20e88649a6a1af3eed83e2b50e.weavy.io/api';

const userData = [
  {
    "id": 1,
    "uid": "harry",
    "display_name": "Harshit Singh",
    "directory_id": 1,
    "created_at": "2024-09-13T06:04:30.01Z"
  },
  {
    "id": 2,
    "uid": "carry",
    "display_name": "Cartel Singh",
    "directory_id": 1,
    "created_at": "2024-09-13T06:16:52.5766667Z",
    "updated_at": "2024-09-13T06:17:18.2233333Z"
  },
  {
    "id": 3,
    "uid": "sri",
    "display_name": "Sri Singh",
    "directory_id": 1,
    "created_at": "2024-09-13T06:19:45.9466667Z"
  }
];

const ChatInterface = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = userData[0]; // Set Harry as the current user

  useEffect(() => {
    setUsers(userData.filter(user => user.id !== currentUser.id));
  }, [currentUser.id]);

  const handleUserSelect = (event) => {
    const selected = users.find(user => user.id === parseInt(event.target.value));
    setSelectedUser(selected);
    if (selected) {
      fetchMessages();
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/apps/demo-chat-app/messages`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      const data = await response.json();
      setMessages(data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser) {
      try {
        const response = await fetch(`${API_BASE_URL}/apps/demo-chat-app/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uid: `msg-${Date.now()}`,
            type: 'chat_message',
            text: newMessage,
            metadata: JSON.stringify({
              senderId: currentUser.id,
              receiverId: selectedUser.id
            })
          })
        });
        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, data]);
        setNewMessage('');
        fetchMessages();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const renderMessage = (message) => {
    const isCurrentUser = message.created_by?.id === currentUser.id;
    return (
      <div 
        key={message.id || message.uid} 
        className={`message-container ${isCurrentUser ? 'sent' : 'received'}`}
      >
        <div className="message-bubble">
          {message.text}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-interface">
      <div className="current-user">
        Logged in as: {currentUser.display_name}
      </div>
      <div className="user-select">
        <select onChange={handleUserSelect}>
          <option value="">Select a user to chat with</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.display_name}
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="chat-window">
          <h2>Chat with {selectedUser.display_name}</h2>
          <div className="messages">
            {messages && messages.length > 0 ? (
              messages.map(renderMessage)
            ) : (
              <p>No messages yet.</p>
            )}
          </div>
          <div className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;