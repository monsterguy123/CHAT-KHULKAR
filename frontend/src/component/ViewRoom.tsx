import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useParams } from "react-router-dom";
import Modal from "react-modal";
import Navbar from "./Navbar";

const socket: Socket = io('http://localhost:3000');

Modal.setAppElement('#root'); 

interface user{ name: string, image: string, id: string };
interface Message{
  message: string,
  createdAt: string,
  sender: { id: string, image: string, name: string }
}

function ViewRoom() {
  const { roomName } = useParams<{ roomName: string }>();
  const [messages, setMessages] = useState<Message[]>([] as Message[]);
  const [sendMessage, setSendMessage] = useState<string>('');
  const [userInfo, setUserInfo] = useState<user | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<user | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const url = `http://localhost:3000/api/user/info`;
        const jwt = localStorage.getItem('JWT');
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        });
        if (res.status === 200) {
          setUserInfo(res.data.data);
        }
      } catch (error: any) {
        console.error("Error fetching user info:", error.message);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(()=>{
    if (!roomName) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const url = `http://localhost:3000/api/message/getMessage/${roomName}`;
        const jwt = localStorage.getItem('JWT');
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        });
        if (res.data && Array.isArray(res.data.msg)) {
          console.log(res.data)
          setMessages(res.data.msg);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  },[])

  useEffect(() => {

    socket.emit('joinRoom', roomName);

    socket.on('message', (data: {
      message: string,
      createdAt: string,
      sender: { id: string, image: string, name: string }
    }) => {
      console.log(data)
      setMessages(prevMessages => [...prevMessages, data]);
    });

    return () => {
      socket.emit('leaveRoom', roomName);
      socket.off('message');
    };

  }, [roomName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendMessage.trim() && roomName && userInfo) {
      socket.emit('message', {
        room: roomName,
        message: sendMessage,
        senderId: userInfo.id,
        imgUrl: userInfo.image,
        name: userInfo.name
      });
      setSendMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const openModal = (user: { name: string, image: string, id: string }) => {
    setSelectedUser(user);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedUser(null);
  };

  const addFriendHandler = async (friendId: string) => {
        const url = `http://localhost:3000/api/friendRequest`;
        const jwt = localStorage.getItem('JWT')
        const res = await axios.post(url,{friendId},{
          headers:{
            Authorization:`Bearer ${jwt}`
          }
        })
        if(res){
              alert(res.data.msg)
        }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-gray-800 py-10 px-5">
        <h1 className="text-5xl text-center font-bold font-serif mb-8 text-gold-500">
          Welcome to the {roomName} Group Chat!
        </h1>
        <div className="max-w-4xl mx-auto bg-white text-black p-6 rounded-lg shadow-lg">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <p>Loading messages...</p>
            </div>
          ) : (
            <div className="mb-4 h-96 overflow-y-auto p-3 bg-gray-100 rounded-lg">
            {
              messages.map((item, key) => {
                return (
                  <div key={key} className={`flex ${item.sender?.id === userInfo?.id ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className="flex items-end">
                      <img
                        src={item?.sender?.image}
                        alt="Avatar"
                        className="object-cover h-8 w-8 rounded-full mr-2 cursor-pointer"
                        onClick={() => openModal(item.sender)}
                      />
                      <div className={`py-3 px-4 ${item.sender?.id === userInfo?.id ? 'bg-blue-400 text-white rounded-br-xl rounded-tl-xl rounded-tr-xl' : 'bg-gray-400 text-white rounded-bl-xl rounded-tl-xl rounded-tr-xl'}`}>
                        <h1 className="text-sm text-yellow-300">{item.sender?.name}</h1>
                        <p>{item.message}</p>
                        <p className="text-xs">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })
              
            }
             <div ref={messagesEndRef} />
            </div>
          )}
          <form onSubmit={submitHandler}>
            <div className="flex justify-between mt-4">
              <input
                className="w-full bg-gray-300 py-2 px-3 rounded-l-lg focus:outline-none"
                type="text"
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                placeholder="Send Message"
              />
              <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-r-lg">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="User Info Modal"
        className="flex justify-center items-center p-4 bg-white rounded-lg shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
      >
        {selectedUser && selectedUser.id !== userInfo?.id && (
          <div className="flex flex-col items-center">
            <button onClick={closeModal} className="mb-4 self-end text-lg font-bold">X</button>
            <img src={selectedUser.image} alt="Selected" className="object-cover h-64 w-64 rounded-lg mb-4" />
            <h2 className="text-xl font-bold mb-2">{selectedUser.name}</h2>
            <button
              onClick={() => addFriendHandler(selectedUser.id)}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg"
            >
              Add as Friend
            </button>
          </div>
        ) 
        }
      </Modal>
    </>
  );
}

export default ViewRoom;
