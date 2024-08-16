import React, { useState, useRef, useEffect } from 'react';
import IconSend from './IconSend';
import { generalFunction } from '../../../assets/Config/generalFunction';
import { apiClient } from '../../../assets/Config/apiClient';
import LineGraph from './LineGraph';
import BarChart from './BarChart';
import PieChart from './PieChart';
import ScatterPlot from './ScatterPlot';
import DoughnutChart from './DoughnutChart';

export default function ChatBot() {
    const textAreaRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [userInput, setUserInput] = useState('');
    const [chats, setChats] = useState([]);
    const [lastMessageIndex, setLastMessageIndex] = useState(null);
    const [chatId, setChatId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchId() {
            const id = await generalFunction.getChatId();
            setChatId(id);
        }
        fetchId(); 
    }, []);

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
    }, [chats, lastMessageIndex]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chats]);

    const handleUserInput = (e) => {
        setUserInput(e.target.value);
    };

    const handleSendMessage = async () => {
        if (userInput.trim() !== '') {
            const userMessage = { sender: 'user', text: userInput };
            setChats([...chats, userMessage]);
            const input = userInput;
            setUserInput('');
            setLastMessageIndex(chats.length);

            setLoading(true); 

            let botResponse = await apiClient.sendUserQuery(input, chatId);

            setLoading(false);

            if (botResponse === "error") {
                botResponse = "It seems your query is too broad. Could you provide more specific details or clarify what you're looking for?";
                setChats((prevChats) => [
                    ...prevChats,
                    { sender: 'bot', text: botResponse }
                ]);
            } else {
                if (botResponse.type === "line graph") {
                    setChats((prevChats) => [
                        ...prevChats,
                        { sender: 'bot', text: '', lineGraph: true, data: botResponse }
                    ]);
                } else if (botResponse.type === "bar chart") {
                    setChats((prevChats) => [
                        ...prevChats,
                        { sender: 'bot', text: '', barChart: true, data: botResponse }
                    ]);
                } else if (botResponse.type === "scatter plot") {
                    setChats((prevChats) => [
                        ...prevChats,
                        { sender: 'bot', text: '', scatterPlot: true, data: botResponse }
                    ]);
                } else if (botResponse.type === "pie chart") {
                    setChats((prevChats) => [
                        ...prevChats,
                        { sender: 'bot', text: '', pieChart: true, data: botResponse }
                    ]);                    
                } else if (botResponse.type === "doughnut chart") {
                    setChats((prevChats) => [
                        ...prevChats,
                        { sender: 'bot', text: '', doughnutChart: true, data: botResponse }
                    ]);      
                } else {
                    setChats((prevChats) => [
                        ...prevChats,
                        { sender: 'bot', text: botResponse }
                    ]);
                }
            }
        }
    };

    return (
        <div className="h-screen flex flex-col justify-center overflow-hidden p-6 text-gray-700">
            <h1 className="text-xl text-center mb-8">Chatbot</h1>
            <div className="m-auto w-[100%] h-[85vh] flex flex-col justify-between items-center border-8 rounded-lg border-gray-100 p-6">
                <div ref={chatContainerRef} className="w-[90%] h-full flex flex-col overflow-y-auto mb-4">
                    {chats.map((chat, index) => (
                        <div
                            key={index}
                            id={`chat-${index}`}
                            className={`inline-block mb-2 px-4 py-2 rounded-3xl max-w-fit ${
                                chat.sender === 'user' ? 'self-end bg-[#0475E6] text-white' : 'self-start bg-gray-200 text-gray-700'
                            }`}
                        >
                            {chat.text}
                            {chat.lineGraph && (
                                <LineGraph chartData={chat.data} />
                            )}
                            {chat.barChart && (
                                <BarChart chartData={chat.data} />
                            )}
                            {chat.pieChart && (
                                <PieChart chartData={chat.data} />
                            )}
                            {chat.scatterPlot && (
                                <ScatterPlot chartData={chat.data} />
                            )}
                            {chat.doughnutChart && (
                                <DoughnutChart chartData={chat.data} />
                            )}                            
                        </div>
                    ))}
                    {loading && (
                        <div className="self-start mb-2 px-4 py-2 rounded-3xl bg-gray-200 text-gray-700 max-w-[55%]">
                            Bot is typing...
                        </div>
                    )}
                </div>
                <div className="relative w-[90%]">
                    <textarea
                        className="w-full rounded-3xl bg-gray-100 px-4 py-3 pr-12 text-base active:outline-none focus:outline-none"
                        placeholder="Type a message..."
                        rows="1"
                        ref={textAreaRef}
                        value={userInput}
                        onChange={handleUserInput}
                        disabled={loading} 
                    />
                    <button
                        className="absolute right-4 bottom-[-2px] transform -translate-y-1/2 bg-gradient-to-br from-[#00EE66] to-[#0475E6] hover:opacity-[75%] text-white px-2 py-2 text-lg rounded-full"
                        onClick={handleSendMessage}
                        disabled={loading} 
                    >
                        <IconSend />
                    </button>
                </div>
            </div>
        </div>
    );
}
