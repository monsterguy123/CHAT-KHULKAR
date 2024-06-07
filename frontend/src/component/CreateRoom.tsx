import axios from "axios";
import React, { useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [roomStatus, setRoomStatus] = useState('');

  const router = useNavigate();

  const SubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = `http://localhost:3000/api/message/createRoom`;
      const jwt = localStorage.getItem('JWT');
      const res = await axios.post(url, { roomName, roomStatus },{
            headers:{
              Authorization:`Bearer ${jwt}`
            }
      });

      if (res && res.data) {
        alert(res.data.msg);
        router('/')
      }
    } catch (error: any) {
      console.error("Error creating room:", error.message || error);
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 -mt-40 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Create a Room and Chat with People Around the Globe
        </h1>
        <form className="space-y-6" onSubmit={SubmitHandler}>
          <div>
            <label htmlFor="room-name" className="block text-sm font-medium text-gray-700">
              Room's Name
            </label>
            <input
              id="room-name"
              name="room-name"
              type="text"
              required
              onChange={(e) => setRoomName(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mt-2"
              placeholder="Room's Name"
            />
          </div>
          <div>
            <label htmlFor="room-status" className="block text-sm font-medium text-gray-700">
              Group Status
            </label>
            <input
              id="room-status"
              name="room-status"
              type="text"
              required
              onChange={(e) => setRoomStatus(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mt-2"
              placeholder="Group Status"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gold-500 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-colors mt-4"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default CreateRoom;
