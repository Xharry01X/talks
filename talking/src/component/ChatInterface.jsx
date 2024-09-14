import React, { useState, useEffect } from 'react';
import "./ChatInterface.css";

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
  },
  {
    "id": 4,
    "uid": "sashi",
    "display_name": "Sashi Singh",
    "directory_id": 1,
    "created_at": "2024-09-13T06:19:45.9466667Z"
  }
];

const ChatInterface = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUsers(userData.filter(user => user.uid !== 'harry'));
    setCurrentUser(userData.find(user => user.uid === 'harry'));
  }, []);

  const checkIfAppExists = async (appUid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/apps/${appUid}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Error checking if app exists:', error);
      return false;
    }
  };

  const createChatApp = async (currentUserUid, selectedUserUid) => {
    const appUid = `chat-${currentUserUid}-${selectedUserUid}`;
    console.log(`Checking if chat app exists: ${appUid}`);

    const appExists = await checkIfAppExists(appUid);
    if (appExists) {
      console.log(`Chat app ${appUid} already exists. Skipping creation.`);
      return { uid: appUid };
    }

    console.log(`Creating chat app: ${appUid}`);
    try {
      const response = await fetch(`${API_BASE_URL}/apps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: appUid,
          type: 'chat',
          display_name: `Chat between ${currentUserUid} and ${selectedUserUid}`,
          access: 'write'
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Chat app created:', data);
      return data;
    } catch (error) {
      console.error('Error creating chat app:', error);
      setError('Failed to create chat app. Please try again.');
      throw error;
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setError(null);
    const appUid = `chat-${currentUser.uid}-${user.uid}`;
    console.log(`Selected user: ${user.display_name}, AppUID: ${appUid}`);
    
    try {
      await createChatApp(currentUser.uid, user.uid);
      await fetchMessages(appUid);
    } catch (error) {
      console.error('Error in handleUserSelect:', error);
      setError('Failed to initialize chat. Please try again.');
    }
  };

  const fetchMessages = async (appUid) => {
    console.log(`Fetching messages for app: ${appUid}`);
    try {
      const response = await fetch(`${API_BASE_URL}/apps/${appUid}/messages`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched messages:', data);
      setMessages(data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to fetch messages. Please try again.');
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser) {
      const appUid = `chat-${currentUser.uid}-${selectedUser.uid}`;
      console.log(`Sending message to app: ${appUid}`);
      try {
        const response = await fetch(`${API_BASE_URL}/apps/${appUid}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: newMessage,
            metadata: { sender_id: currentUser.uid },
          })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Message sent:', data);
        setMessages(prevMessages => [...prevMessages, data]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message. Please try again.');
      }
    }
  };

  const renderMessage = (message) => {
    const isCurrentUser = message.metadata?.sender_id === currentUser.uid;
    const senderName = isCurrentUser ? currentUser.display_name : selectedUser.display_name;
    return (
      <div 
        key={message.id} 
        className={`message ${isCurrentUser ? 'sent' : 'received'}`}
      >
        <div className="message-content">
          <p className="sender-name">{senderName}</p>
          <p>{message.text}</p>
          <span className="timestamp">{new Date(message.created_at).toLocaleTimeString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-interface">
      <div className="user-list">
        <h2>Users</h2>
        {users.map(user => (
          <div 
            key={user.id} 
            className={`user-item ${selectedUser && selectedUser.id === user.id ? 'active' : ''}`}
            onClick={() => handleUserSelect(user)}
          >
            {user.display_name}
          </div>
        ))}
      </div>
      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h2>Chat with {selectedUser.display_name}</h2>
            </div>
            <div className="messages-container">
              {error && <p className="error-message">{error}</p>}
              {messages.length > 0 ? (
                messages.map(renderMessage)
              ) : (
                <p className="no-messages">No messages yet.</p>
              )}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;