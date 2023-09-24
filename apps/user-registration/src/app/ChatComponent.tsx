import React, { useContext, useEffect, useState } from 'react'
import RoomList from './RoomList'
import UserContext from './userContext';
import useInitials from './hooks/useInitials';
import axios from 'axios';
import CreateChatRoom from './CreateChatRoom';
import { io } from 'socket.io-client';
import ChatInterface from './chatInterface';


export default function ChatComponent() {
    const user =  useContext(UserContext);
    console.log("USER =>", user)
    const userName = `${user.firstName} ${user.lastName}`;
    const userInitials = useInitials(userName);

    const [chatRooms , setChatRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [socket, setSocket] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);

    const [roomId, setRoomId] = useState(null);
    const [chatRoomName, setChatRoomName] = useState(null)
    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };
    useEffect(() => {
    // Create a connection to the Socket.IO server
    const socketInstance = io('http://localhost:3333'); // Replace with your server URL
    setSocket(socketInstance);
    
    // Handle incoming 'ping' messages
    socketInstance.on('ping', () => {
        // Respond to the 'ping' with a 'pong' message
        console.log('pinged')
        socketInstance.emit('pong');
    });
    
    /// Handle incoming messages from the server
    socketInstance.on('receive_message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      
      socketInstance.on("msg-recieve", (msg) => {
        console.log(msg)
        //setArrivalMessage({ fromSelf: false, message: msg });
      });
      // Clean up the socket connection when the component unmounts
      return () => {
        socketInstance.disconnect();
      };
  }, []);

    useEffect(() =>{
        axios.get("http://localhost:3333/api/chatrooms", {withCredentials:true})
        .then(res => setChatRooms(res.data)) 
    },[])

    useEffect(() => {
        // Call fetchChatRoomMessages when the component mounts or when roomId changes
        console.log("CHECK IF I AM  TRIGGERED")
        fetchChatRoomMessages('650f4f188fbf5342227b0c3a');
      }, [roomId]);

    const fetchChatRoomMessages = async (roomId) => {
        try {
          // Make an API request to retrieve messages for the given chat room ID
          const response = await axios.get(`http://localhost:3333/api/chatroom/${roomId}/messages`);
          const messages = response.data;
          setMessages(response.data.messages)
          setChatRoomName(response.data.chatRoomName)
          console.log("chat room messages =>",messages)
          // Process and display the retrieved messages in your chat interface
          // Update the state or component to show these messages to the user
        } catch (error) {
          console.error('Error fetching chat room messages:', error);
          // Handle any error that occurs during the API request
        }
    };

   
    const sendMessage = (messageText) => {
        console.log("Sending message")
        const message = {
            senderInfo: {...user}, // Replace with the actual sender's name
            chatRoomId: '650f4f188fbf5342227b0c3a', // Include the chat room ID
            text: messageText,
          };
        // Emit a 'chatMessage' event to the server with the message content
        socket.emit('chatMessage', {message});
    
        // Clear the message input field
        // setMessageInput('');
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
                <RoomList rooms = {chatRooms}/>
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
            <ChatInterface messages={messages} chatRoomName={chatRoomName} sendMessage={sendMessage}/>
        </div>
        <div className='w-[25%] bg-white border border-gray-300 h-screen'>

        </div>

        <CreateChatRoom isOpen={isModalOpen} closeModal={closeModal} />
    </div>
  )
}
