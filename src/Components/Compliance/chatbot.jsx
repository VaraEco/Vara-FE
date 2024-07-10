import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const userId = JSON.parse(localStorage.getItem('varaUserId'));
  console.log(userId)

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    setMessages(savedMessages);
  }, []);

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { sender: 'user', text: input };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      try {
        const response = await axios.post('https://summer-river-7171.ploomberapp.io/api/chatbot/message/query', {
        message: input,
        userId: userId
        });
        const botMessage = { sender: 'bot', text: response.data.response };
        setMessages([...updatedMessages, botMessage]);
      } catch (error) {
        console.error('Error sending message to backend:', error);
      }
      
      setInput('');
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
