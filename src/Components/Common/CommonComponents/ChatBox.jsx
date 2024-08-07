import React, { useState, useRef, useEffect } from 'react';
import IconSend from './IconSend';

export default function ChatBot() {
    const textAreaRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [userInput, setUserInput] = useState('');
    const [userChats, setUserChats] = useState([]);
    const [lastMessageIndex, setLastMessageIndex] = useState(null);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto'; 
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px"; 
        }
    }, [userInput]);

    useEffect(() => {
        if (lastMessageIndex !== null) {
            const newMessage = document.getElementById(`chat-${lastMessageIndex}`);
            if (newMessage) {
                newMessage.classList.add('slide-up');
            }
        }
    }, [userChats, lastMessageIndex]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [userChats]);

    const handleUserInput = (e) => {
        setUserInput(e.target.value);
    };

    const handleSendMessage = () => {
        if (userInput.trim() !== '') {
            setUserChats([...userChats, userInput]);
            setLastMessageIndex(userChats.length);
            setUserInput('');
        }
    };

    return (
        <div className="h-screen flex flex-col justify-center overflow-hidden p-6 text-gray-700">
            <h1 className="text-xl text-center mb-8">Chatbot</h1>
            <div className="m-auto w-[95%] h-[85vh] flex flex-col justify-between items-center border-8 rounded-lg border-gray-100 p-6">
                <div ref={chatContainerRef} className="w-[90%] h-full flex flex-col items-end overflow-y-auto mb-4">
                    {userChats.map((chat, index) => (
                        <div
                            key={index}
                            id={`chat-${index}`}
                            className="inline-block mb-2 px-4 py-2 rounded-3xl bg-[#0475E6] text-white max-w-[80%]"
                        >
                            {chat}
                        </div>
                    ))}
                </div>
                <div className="relative w-[90%]">
                    <textarea
                        className="w-full rounded-3xl bg-gray-100 px-4 py-3 text-base active:outline-none focus:outline-none"
                        placeholder="Type a message..."
                        rows="1"
                        ref={textAreaRef}
                        value={userInput}
                        onChange={handleUserInput}
                    />
                    <button
                        className="absolute right-4 bottom-[-2px] transform -translate-y-1/2 bg-gradient-to-br from-[#00EE66] to-[#0475E6] hover:opacity-[75%] text-white px-2 py-2 text-lg rounded-full"
                        onClick={handleSendMessage}
                    >
                        <IconSend />
                    </button>
                </div>
            </div>
        </div>
    );
}
