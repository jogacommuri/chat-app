import React, { useContext, useEffect, useState } from 'react'
import RoomList from './RoomList'

import useInitials from './hooks/useInitials';
import axios from 'axios';
import CreateChatRoom from './CreateChatRoom';
import { io } from 'socket.io-client';
import ChatInterface from './ChatInterface';
import UsersList from './UsersList';
import Cookies from "js-cookie";
import { API_BASE_URL } from './api';

interface UserType{
        firstName: string;
        lastName: string;
        email: string;
        _id: string;
}

export default function ChatComponent({user} ) {
    // const { user } = useUserContext();

   
    // const user = userDetails.userDetails;
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';

    const userInitials = useInitials(userName);

    const [chatRooms , setChatRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [socket, setSocket] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);

    const [roomId, setRoomId] = useState(null);
    const [chatRoomName, setChatRoomName] = useState(null);
    const [usersInRoom, setUsersInRoom] = useState(null);

    const [userRooms, setUserRooms] = useState([]);
    const [activeRooms, setActiveRooms] = useState([]);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };
    useEffect(() => {
        console.log('User state updated from ChatComponent:', user);
      }, [user]);
    useEffect(() => {
    // Create a connection to the Socket.IO server
    const socketInstance = io(`${API_BASE_URL}`); // Replace with your server URL
    setSocket(socketInstance);
    
    
    socketInstance.on('connectionStatus', (status) => {
        if (status === 'active') {
          // Connection is active, you can enable chat features, etc.
          console.log('Socket connection is active.');
        } else if (status === 'disconnected') {
          // Connection is lost, you can disable chat features or show a message
          console.log('Socket connection is disconnected.');
        }
      });

    socketInstance.on('systemMessage', (messages) => {

        setMessages(messages);
      });
    /// Handle incoming messages from the server
    socketInstance.on('receive_message', (messages) => {

        setMessages(messages);
      });
      
      // Clean up the socket connection when the component unmounts
      return () => {
        socketInstance.disconnect();
      };
  }, []);

    useEffect(() =>{
        axios.get(`${API_BASE_URL}/api/chatrooms`, {withCredentials:true})
        .then(res => {
            setChatRooms(res.data)
            const userChatRooms = res.data.filter(room => (
                room.users.some(userInRoom => userInRoom._id === user?._id)
            ));
            
            const userRoomIds = userChatRooms.map(room => room._id);
           
            setUserRooms(userRoomIds);
           
            
        });
        
    },[user])
    
    useEffect(() => {
        // Call fetchChatRoomMessages when the component mounts or when roomId changes
        if(roomId!== null && roomId !== undefined) {
            
            fetchChatRoomMessages(roomId);
            chatRoomUsers(roomId);
        }else{
            setUsersInRoom(null);
            // setMessages([])
            // setChatRoomName(null)
        }
          
      }, [roomId]);

    const fetchChatRoomMessages = async (roomId) => {
        try {
          // Make an API request to retrieve messages for the given chat room ID`${API_BASE_URL}/api/chatrooms`
          const response = await axios.get(`${API_BASE_URL}/api/chatroom/${roomId}/messages`);
          const messages = response.data;
          setUsersInRoom(response.data?.chatRoomUsers);
          
          setMessages(response.data.messages)
          setChatRoomName(response.data.chatRoomName)
     
        } catch (error) {
          console.error('Error fetching chat room messages:', error);
          // Handle any error that occurs during the API request
        }
    };

    const chatRoomUsers = async (roomId) =>{
        const chatRoom = chatRooms.find((room) => room.id === roomId) || [];
        //const userIdsInRoom = chatRoom?.users;
       // const usersInRoom = users.filter((user) => userIdsInRoom.includes(user.id));
        
        setUsersInRoom(chatRoom?.users);
        return usersInRoom;
    }
   
    const sendMessage = (messageText) => {
        console.log("Sending message")
        const message = {
            senderInfo: {...user}, // Replace with the actual sender's name
            chatRoomId: roomId, // Include the chat room ID
            text: messageText,
          };
        // Emit a 'chatMessage' event to the server with the message content
        socket.emit('chatMessage', roomId,user,messageText);
          
        setMessages((prevMessages) => [...prevMessages, message]);
        // Clear the message input field
        setMessageInput('');
      };
      const joinChatRoom = (roomId) => {
        socket.emit('joinRoom', roomId, user);
        setActiveRooms((prevActiveRooms) => [...prevActiveRooms, roomId]);
        setRoomId(roomId); 
        
      };
      const leaveChatRoom = (roomId) => {
        if (roomId) {
          socket.emit('leaveRoom', roomId, user);
          setRoomId(roomId); // Reset the current room ID in state
          setActiveRooms((prevActiveRooms) => prevActiveRooms.filter((room) => room !== roomId));
        }
      };
      const userInRoom = (roomId) => {
        //console.log("ACTIVE ROOM", userRooms)
        setRoomId(userRooms[0])
        return userRooms.includes(roomId);
      };
    
      const handleLeaveRoom = async (roomId) => {
        try {
          // Send a POST request to leave the chat room
          const response = await axios.post(`${API_BASE_URL}/api/leave/${roomId}`, user, {
            withCredentials: true,headers: {
              Authorization: `${authToken}`,
            },
          });
      
          if (response.status === 200) {
            console.log(`Leaving room ${roomId}`);
            setUserRooms((prevRooms) => prevRooms.filter((room) => room !== roomId));
            leaveChatRoom(roomId)
            console.log('Successfully left the chat room');
          } else {
            // Handle errors here
            console.error('Failed to leave the chat room:', response.data.error);
          }
        } catch (error) {
          console.error('Error leaving chat room:', error);
        }
      };
      const getAuthTokenFromCookie = () => {
    
    
        return Cookies.get("token");
      };
      const authToken = getAuthTokenFromCookie(); 
      const handleJoinRoom = async (roomId) => {
       
        try {
          // Send a POST request to join the chat room
          const response = await axios.post(`${API_BASE_URL}/api/join/${roomId}`, user, {
            withCredentials: true,  headers: {
              Authorization: `${authToken}`,
            },
          });
  
          if (response.status === 200) {
            // Successfully joined the chat room
            // You can implement the logic to navigate to the chat room or show a success message here
            joinChatRoom(roomId);
            setUserRooms((prevRooms) => [...prevRooms, roomId]);
            console.log('Successfully joined the chat room');
          } else {
            // Handle errors here, such as room not found or user already in the room
            console.error('Failed to join the chat room:', response.data.error);
          }
        } catch (error) {
          console.error('Error joining chat room:', error);
        }
      };
      const updateActiveRooms = (roomId) => {
        if (userInRoom(roomId)) {
          // User is already in the room, so leave it
          handleLeaveRoom(roomId);
          setActiveRooms((prevActiveRooms) => prevActiveRooms.filter((activeRoom) => activeRoom !== roomId));
        } else {
          // User is not in the room, so join it
          handleJoinRoom(roomId);
          setActiveRooms((prevActiveRooms) => [...prevActiveRooms, roomId]);
        }
      };
  return (
    <div className='w-screen flex px-6 rounded-lg'>
        <div className='w-[25%] bg-white border border-gray-300 h-screen'>
            <div className='flex items-center justify-center p-5 '>
                <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{userInitials}</span>
                </div>
                <div className='ml-4'>
                    <span className='font-medium font-mono text-gray-600 dark:text-gray-300'>{userName}</span>
                </div>
            </div>
            <hr></hr>
            <div className='p-5'>
                <RoomList 
                    rooms = {chatRooms}  
                  
                    userInRoom={userInRoom}
                    activeRooms={activeRooms}
                    // setActiveRooms={setActiveRooms}
                    setActiveRooms={updateActiveRooms}
                    />
            </div>
            <div className="flex items-center justify-center">
                <button 
                    className='bg-slate-600 w-ful text-white px-4 py-2 rounded' 
                    onClick={openModal}
                > 
                    Create Room
                </button>
            </div>
        </div>
        <div className='w-[50%] bg-white border border-gray-300 h-screen'>
            <ChatInterface messages={messages} chatRoomName={chatRoomName} sendMessage={sendMessage} user={user} />
        </div>
        <div className='w-[25%] bg-white border border-gray-300 h-screen p-5'>
            <UsersList userList={usersInRoom}/>
        </div>

        <CreateChatRoom isOpen={isModalOpen} closeModal={closeModal} setChatRooms={setChatRooms}/>
    </div>
  )
}
