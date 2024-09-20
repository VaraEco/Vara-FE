import React, { useState, useRef, useEffect } from "react";
import IconSend from "./IconSend";
import IconInfo from "./IconInfo";
import { generalFunction } from "../../../assets/Config/generalFunction";
import { apiClient } from "../../../assets/Config/apiClient";
import LineGraph from "./LineGraph";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import ScatterPlot from "./ScatterPlot";
import DoughnutChart from "./DoughnutChart";
import InfoPopUp from "./InfoPopUp";
import IconCopy from "./IconCopy";
import IconRedo from "./IconRedo";
import CsvToTable from "./CsvToTable";
import Switch from "./Switch";

export default function ChatBot({ allData }) {
  const textAreaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const sendButtonRef = useRef(null);
  const [userInput, setUserInput] = useState("");
  const [chats, setChats] = useState([]);
  const [lastMessageIndex, setLastMessageIndex] = useState(null);
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [tooltipCopyText, setTooltipCopyText] = useState("Copy");
  const [regenText, setRegenText] = useState("Regenerate");
  const [isChecked, setIsChecked] = React.useState(true);

  useEffect(() => {
    async function fetchId() {
      const id = await generalFunction.getChatId();
      setChatId(id);
    }
    fetchId();
  }, []);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  }, [userInput]);

  useEffect(() => {
    if (lastMessageIndex !== null) {
      const newMessage = document.getElementById(`chat-${lastMessageIndex}`);
      if (newMessage) {
        newMessage.classList.add("slide-up");
      }
    }
  }, [chats, lastMessageIndex]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const openTips = (e) => {
    setIsTipsOpen(true);
  };

  const closeTips = (e) => {
    setIsTipsOpen(false);
  };

  const handleSendMessage = async () => {
    if (userInput.trim() !== "") {
      const userMessage = { sender: "user", text: userInput };
      setIsInfoOpen(false);
      setChats([...chats, userMessage]);
      const input = userInput;
      setUserInput("");
      setLastMessageIndex(chats.length);

      setLoading(true);

      let botResponse = await apiClient.sendUserQuery(input, chatId);

      setLoading(false);

      if (botResponse === "error") {
        botResponse =
          "It seems your query is too broad. Could you provide more specific details or clarify what you're looking for?";
        setChats((prevChats) => [
          ...prevChats,
          { sender: "bot", text: botResponse },
        ]);
      } else {
        if (botResponse.type === "line graph") {
          setChats((prevChats) => [
            ...prevChats,
            { sender: "bot", text: "", lineGraph: true, data: botResponse },
          ]);
        } else if (botResponse.type === "bar chart") {
          setChats((prevChats) => [
            ...prevChats,
            { sender: "bot", text: "", barChart: true, data: botResponse },
          ]);
        } else if (botResponse.type === "scatter plot") {
          setChats((prevChats) => [
            ...prevChats,
            { sender: "bot", text: "", scatterPlot: true, data: botResponse },
          ]);
        } else if (botResponse.type === "pie chart") {
          setChats((prevChats) => [
            ...prevChats,
            { sender: "bot", text: "", pieChart: true, data: botResponse },
          ]);
        } else if (botResponse.type === "doughnut chart") {
          setChats((prevChats) => [
            ...prevChats,
            { sender: "bot", text: "", doughnutChart: true, data: botResponse },
          ]);
        } else {
          setChats((prevChats) => [
            ...prevChats,
            {
              sender: "bot",
              text: `${botResponse.label}: ${botResponse.data}`,
            },
          ]);
        }
      }
    }
  };

  const handleCopyResponse = (text) => {
    navigator.clipboard.writeText(text);
    setTooltipCopyText("Copied");
    setTimeout(() => {
      setTooltipCopyText("Copy");
    }, 1000);
  };

  const handleTriggerClick = () => {
    if (sendButtonRef.current) {
      sendButtonRef.current.click();
    }
  };

  const handleRegenerate = async () => {
    const lastUserMessage = chats[chats.length - 2];
    if (lastUserMessage.sender === "user") {
      setRegenText("Sent");
      setTimeout(() => {
        setRegenText("Regenerate");
      }, 1000);
      await setUserInput(lastUserMessage.text);
      handleTriggerClick();
    }
  };

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="h-[screen] flex flex-col w-[100%] justify-center overflow-auto p-6 text-gray-700">
      
      <div className="w-[100%] mt-[100px] relative flex flex-row justify-center items-center">
        <h1 className="text-center text-2xl">VaraBot</h1>
        <IconInfo
          className="text-3xl ml-1 hover:opacity-[50%] hover:cursor-pointer"
          onClick={openTips}
        />

<div className="flex items-center justify-center absolute right-[20px] gap-2">
 
<h1 className="text-[15px] tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-[#00EE66] to-[#0475E6]">SHOW TABLE</h1>
 <Switch checked={isChecked} onChange={handleToggle} />

   
 </div>
      </div>

      {isChecked && <div
        style={{
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px'
        }}
        className="m-5"
      >
        <CsvToTable allData={allData} />
      </div>}

      <div className="w-[100%] h-[65vh] flex flex-col gap-20 items-center rounded-lg p-4">
        <div
          ref={chatContainerRef}
          className="w-[100%]"
        >
          {isInfoOpen && (
            <div className="flex justify-center items-stretch gap-6">
              {[
                {
                  title: "Ensure Data Quality",
                  description:
                    "Before uploading, please verify that your data is clean, well-organized, and formatted correctly for optimal results.",
                },
                {
                  title: "Specify Your Chart Requirements",
                  description:
                    "When requesting a chart, be as specific as possible. Clearly mention the data you want on the X and Y axes to ensure accurate visualization.",
                },
                {
                  title: "Supported Chart Types",
                  description:
                    "Our chatbot currently supports the following types: Pie Chart, Bar Chart, Doughnut Chart, Scatter Plot, and Line Graph.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-100 shadow-md p-8 rounded-lg hover:bg-gray-100"
                >
                  <div className="text-left space-y-4">
                    <div>
                      <p className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#00EE66] to-[#0475E6]">
                        {item.title}
                      </p>
                      <p>{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {chats.map((chat, index) => (
            <div
              key={index}
              id={`chat-${index}`}
              className={`relative inline-block mb-2 px-4 py-2 rounded-3xl max-w-fit ${
                chat.sender === "user"
                  ? "self-end bg-[#0475E6] text-white"
                  : "self-start bg-gray-200 text-gray-700"
              }`}
            >
              {chat.text}
              {chat.lineGraph && <LineGraph chartData={chat.data} />}
              {chat.barChart && <BarChart chartData={chat.data} />}
              {chat.pieChart && <PieChart chartData={chat.data} />}
              {chat.scatterPlot && <ScatterPlot chartData={chat.data} />}
              {chat.doughnutChart && <DoughnutChart chartData={chat.data} />}
              {chat.sender === "bot" &&
                chat.text &&
                index === chats.length - 1 && (
                  <div className="flex flex-row gap-1 absolute top-11 text-md text-gray-500">
                    <div className="relative group">
                      <div
                        className="rounded-md p-1.5 hover:bg-gray-100 hover:cursor-pointer"
                        onClick={() => handleCopyResponse(chat.text)}
                      >
                        <IconCopy />
                      </div>
                      <div className="absolute top-[100%] left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:flex flex-col items-center">
                        <div className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded-md">
                          {tooltipCopyText}
                        </div>
                      </div>
                    </div>
                    <div className="relative group">
                      <div
                        className="rounded-md p-1.5 hover:bg-gray-100 hover:cursor-pointer"
                        onClick={() => handleRegenerate()}
                      >
                        <IconRedo />
                      </div>
                      <div className="absolute top-[100%] left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:flex flex-col items-center">
                        <div className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded-md">
                          {regenText}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          ))}
          {loading && (
            <div className="self-start mb-2 px-4 py-2 rounded-3xl bg-gray-200 text-gray-700 max-w-[55%]">
              Bot is typing...
            </div>
          )}
        </div>
        <div className="w-[100%] relative bottom-10">
          <textarea
            className="w-full rounded-3xl bg-gray-100 px-4 py-3 pr-12 text-base active:outline-none focus:outline-none"
            placeholder="Chat with your data..."
            rows="1"
            ref={textAreaRef}
            value={userInput}
            onChange={handleUserInput}
            disabled={loading}
          />
          <button
            className="absolute right-4 top-6 transform -translate-y-1/2 bg-gradient-to-br from-[#00EE66] to-[#0475E6] hover:opacity-[50%] text-white px-2 py-2 text-lg rounded-full"
            onClick={handleSendMessage}
            disabled={loading}
            ref={sendButtonRef}
          >
            <IconSend />
          </button>{" "}
          <div className="text-xs text-gray-500 text-center">
            VaraBot can make mistakes. Please check your response and the
            instructions.
          </div>
        </div>
      </div>
      {isTipsOpen && <InfoPopUp closeInfo={closeTips} />}
    </div>
  );
}
