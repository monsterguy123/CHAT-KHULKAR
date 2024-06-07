import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Navbar from "./Navbar";

interface FriendRequest {
    id:string
    user: {
        id:string
        name: string;
        image: string;
    };
}

const Notifications = () => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        const url = `http://localhost:3000/api/requests`;
        const jwt = localStorage.getItem('JWT');

        try {
            const res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            });

            if (res.status === 200) {
                console.log(res.data)
                setRequests(res.data.data);
            } else {
                setError('Failed to fetch requests');
            }
        } catch (err) {
            setError('An error occurred while fetching requests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);


    const  AddFriendHandler = async (friendId:string,id:string)=>{
        const url = `http://localhost:3000/api/addFriend`;
         const jwt = localStorage.getItem('JWT')
         const res = await axios.post(url,{friendId,id},{
              headers:{
                Authorization:`Bearer ${jwt}`
              }
         })
         if(res){
            alert(res.data.msg);
            fetchRequests();
         }
    }

    const DeclineHandler = async(id:string,friendId:string)=>{
           const url = `http://localhost:3000/api/declineRequest`;
           const jwt = localStorage.getItem('JWT');
           const res = await axios.put(url,{
             id,friendId
           },
        {
            headers:{
                Authorization:`Bearer ${jwt}`
            }
        });
        if(res){
            alert(res.data.msg);
            fetchRequests();
        }
    }

    if (loading) {
        return <div>        
            <Navbar />
            <div>Loading...</div>
        </div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100">
            {
                requests.length === 0 ? (
                    <div className="w-full max-w-sm mx-auto overflow-hidden rounded shadow-sm">
                        <div className="p-3 bg-white border mt-20 border-gray-300 rounded">
                            <p className="text-center text-gray-700">No friend requests right now.</p>
                        </div>
                    </div>
                ) : (
                    requests.map((req, key) => (
                        <div key={key} className="w-full max-w-sm mx-auto my-10 overflow-hidden rounded shadow-sm">
                            <div className="relative flex items-center justify-between px-2 py-2 font-bold text-white bg-blue-500">
                                <div className="relative flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        className="inline w-6 h-6 mr-2 opacity-75">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    <span>New Request</span>
                                </div>
                            </div>
                            <div className="p-3 bg-white border border-gray-300 rounded-b">
                                <div className="flex justify-start mb-2">
                                    <div>
                                        <img src={req.user.image} alt={`${req.user.name}'s profile`}
                                            className="inline object-cover w-12 h-12 mr-2 rounded-full" />
                                    </div>
                                    <div>
                                        <span className="block leading-tight text-gray-500">You Got A Friend Request From...</span>
                                        <p className="font-medium leading-tight text-gray-700">{req.user.name}</p>
                                    </div>
                                </div>
                                <div className="block w-full mt-3 text-right">
                                    <button
                                        onClick={()=>DeclineHandler(req.id,req.user.id)}
                                        className="px-4 py-2 font-semibold text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-100 focus:outline-none">
                                        Decline
                                    </button>
                                    <button
                                        onClick={()=>AddFriendHandler(req.user.id,req.id)}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none">
                                        Accept
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )
            }
            </div>
        </>
    );
}

export default Notifications;
