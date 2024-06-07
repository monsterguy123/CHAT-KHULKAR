import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { Socket, io } from 'socket.io-client';

const socket: Socket = io("http://localhost:3000/friend");

interface Friend {
  id: string;
  friend: {
    id: string;
    name: string;
    image: string;
  };
}

interface User {
  name: string;
  id: string;
  image: string;
}

const Friends: React.FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [userInfo, setUserInfo] = useState<User>({} as User);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ sender:{name: string, image: string}, senderId: string, message: string, date: string }[]>([]);
  const [roomId, setRoom] = useState<string>('');

  const getMessages = async()=>{
     try {
        const url = `http://localhost:3000/api/oneVone/getRoomMessages/${roomId}`;
        const jwt = localStorage.getItem('JWT');
        const res = await axios.get(url,{
          headers:{
            Authorization:`Bearer ${jwt}`
          }
        })
        console.log(res.data)
        setMessages(res.data.message);
     } catch (error) {
       console.log(error);
     }
  }

  const fetchUserInfo = async () => {
    const url = `http://localhost:3000/api/user/info`;
    const jwt = localStorage.getItem('JWT');
    
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });
    if (res) {
      setUserInfo(res.data.data);
    }
  }

  const fetchRoom = async () => {
    try {
      const url = `http://localhost:3000/api/onevone/room/${selectedFriend?.friend.id}`;
      const jwt = localStorage.getItem('JWT');
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
  
      if (res.status === 200) {
        console.log(res.data)
        const room1 = res.data.room1 || "";
        const room2 = res.data.room2 || "";
        if(room1){
          setRoom(room1.id);
        }else{
          setRoom(room2.id);
        }
      } else {
        console.error('Unexpected response structure:', res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(()=>{
   fetchUserInfo();
   fetchFriends();
  },[])

  useEffect(() => {
    fetchRoom();
  }, [selectedFriend]);

  useEffect(()=>{
    getMessages();
    socket.emit("JoinRoom", roomId);
  },[roomId])

  useEffect(() => {
    socket.on('message', (data: { message: string, senderId: string, sender:{image: string, name: string}, date: string }) => {
      console.log(data)
      setMessages(prevMessages => [...prevMessages, data]);
    });

    return () => {
        socket.off('message'); 
    };
  }, [selectedFriend]);

  const fetchFriends = async () => {
    try {
      const url = "http://localhost:3000/api/friends/getAllFriends";
      const jwt = localStorage.getItem('JWT');
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      if (res.status === 200) {
        setFriends(res.data.friends);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFriend) {
      const messageData = {
        roomId,
        senderId: userInfo.id,
        message,
        receiverId: selectedFriend.friend.id,
        name: userInfo.name,
        image: userInfo.image
      };
      
      socket.emit("message", messageData);
      setMessage(''); 
    } else {
      console.log('No friend selected.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-20 shadow-lg rounded-lg h-128">
        <div className="flex flex-row justify-between bg-white h-full">
          {/* Friend List */}
          <div className="flex flex-col w-1/3 border-r-2 h-full overflow-y-auto">
            {friends.map((item, key) => (
              <div
                key={key}
                className={`flex flex-row py-4 px-2 justify-center items-center border-b-2 cursor-pointer ${
                  selectedFriend?.id === item.id ? 'bg-gray-200' : ''
                }`}
                onClick={() => setSelectedFriend(item)}
              >
                <div className="w-1/4">
                  <img
                    src={item.friend.image}
                    className="object-cover h-12 w-12 rounded-full"
                    alt={item.friend.name}
                  />
                </div>
                <div className="w-full">
                  <div className="text-lg font-semibold">{item.friend.name}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Chat Messages */}
          <div className="w-2/3 px-5 flex flex-col justify-between">
            {selectedFriend ? (
              <div className="mb-4 h-96 overflow-y-auto p-3 bg-gray-100 rounded-lg">
                {messages.map((item, idx) => (
                  <div key={idx} className={`flex ${item.senderId === userInfo?.id ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className="flex items-end">
                      <img
                        src={item.sender.image}
                        alt="Avatar"
                        className="object-cover h-8 w-8 rounded-full mr-2 cursor-pointer"
                      />
                      <div className={`py-3 px-4 ${item.senderId === userInfo?.id ? 'bg-blue-400 text-white rounded-br-xl rounded-tl-xl rounded-tr-xl' : 'bg-gray-400 text-white rounded-bl-xl rounded-tl-xl rounded-tr-xl'}`}>
                        <p>{item.message}</p>
                        <p className="text-xs">{new Date(item.date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Select a friend to start chatting</div>
              </div>
            )}
            <form onSubmit={submitHandler}>
              <div className="flex justify-between mt-4 mb-5">
                <input
                  className="w-full bg-gray-300 py-2 px-3 rounded-l-lg focus:outline-none"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send Message"
                />
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-r-lg">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Friends;
