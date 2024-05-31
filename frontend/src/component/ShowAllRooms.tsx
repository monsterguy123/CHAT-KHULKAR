import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

interface Room {
  groupName: string;
  groupStatus: string;
}

const ShowAllRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const url = `http://localhost:3000/getallrooms`;
        const response = await axios.get(url);

        if (response.status === 201) {
          setRooms(response.data.rooms);
        }
      } catch (error: any) {
        setError(error.message);
      }
    };
    fetchRooms();
  }, []);

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-100 text-gray-800 py-10">
      <h1 className="text-5xl text-black text-center font-bold font-serif mb-8 ">Where words crown connections in elegance</h1>

      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {rooms.map((room, index) => (
          <div key={index} className="border border-gray-300 bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <p className="text-2xl font-bold mb-2 text-gray-900">{room.groupName}</p>
            <p className="text-lg mb-4 text-gray-700">{room.groupStatus}</p>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"><Link to={`/room/${room.groupName}`}>SLIDE IN</Link></button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default ShowAllRooms;
