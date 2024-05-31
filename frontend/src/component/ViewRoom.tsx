import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";

const socket: Socket = io('http://localhost:3000/admin');

function ViewRoom() {
  const [messages, setMessages] = useState<{ message: string }[]>([]);
  const [sendMessage, setSendMessage] = useState<string>('');
  const { roomName } = useParams<{ roomName: string }>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (roomName) {
      socket.emit('joinRoom', roomName);
      const fetchMessages = async () => {
        try {
          const url = `http://localhost:3000/getMessage/${roomName}`;
          const res = await axios.get(url);
          if (res.data && Array.isArray(res.data.msg)) {
            setMessages(res.data.msg);
          } else {
            setMessages([]);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          setMessages([]);
        }
      };
      fetchMessages();

      socket.on('message', (data: { message: string }) => {
        setMessages((prevMessages) => [...prevMessages, data]);
        scrollToBottom();
      });
    }

    return () => {
      if (roomName) {
        socket.emit('leaveRoom', roomName);
        socket.off('message');
      }
    };
  }, [roomName]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (sendMessage.trim() && roomName) {
      socket.emit('message', { room: roomName, message: sendMessage });
      setSendMessage('');
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-white text-gray-800 py-10 px-5">
      <h1 className="text-5xl text-center font-bold font-serif mb-8 text-gold-500">
        Welcome to the {roomName} Group Chat!
      </h1>
      <form onSubmit={submitHandler} className="max-w-4xl mx-auto bg-white text-black p-6 rounded-lg shadow-lg">
        <div className="mb-4 h-96 overflow-y-auto p-3 bg-gray-100 rounded-lg">
          {messages.map((item, key) => (
            <p key={key} className="mb-2 p-3 bg-gray-200 text-gray-800 rounded-lg animate-fade-in">
              {item.message}
            </p>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <input
            onChange={(e) => setSendMessage(e.target.value)}
            type="text"
            value={sendMessage}
            placeholder="Type a message..."
            className="flex-1 p-3 rounded-l-lg border-2 border-gray-300"
          />
          <button
            type="submit"
            className="bg-gold-500 text-white p-3 rounded-r-lg hover:bg-gold-600 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
    </>
  );
}

export default ViewRoom;
