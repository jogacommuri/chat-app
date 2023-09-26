import React, { useContext, useEffect, useState } from 'react'
import RoomList from './RoomList'
import UserContextProvider, { useUserContext } from './UserContextProvider';
import useInitials from './hooks/useInitials';
import axios from 'axios';
import CreateChatRoom from './CreateChatRoom';
import { io } from 'socket.io-client';
import ChatInterface from './ChatInterface';
import UsersList from './UsersList';

interface UserType{
        firstName: string;
        lastName: string;
        email: string;
        _id: string;
}

export default function ChatComponent( userDetails ) {
    // const { user } = useUserContext();

    // console.log("USER =>", user)
    const user = userDetails.userDetails;
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
        console.log('User state updated from ChatComponent:', userDetails);
      }, [user]);
    useEffect(() => {
    // Create a connection to the Socket.IO server
    const socketInstance = io('http://localhost:3333'); // Replace with your server URL
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
        debugger;
        console.log(messages)
        setMessages(messages);
      });
    /// Handle incoming messages from the server
    socketInstance.on('receive_message', (messages) => {
        debugger;
        console.log("CHAT MESSAGES",messages)
        setMessages(messages);
      });
      
      // Clean up the socket connection when the component unmounts
      return () => {
        socketInstance.disconnect();
      };
  }, []);

    useEffect(() =>{
        axios.get("http://localhost:3333/api/chatrooms", {withCredentials:true})
        .then(res => {
            setChatRooms(res.data)
            const userChatRooms = res.data.filter(room => (
                room.users.some(userInRoom => userInRoom._id === user._id)
            ));
            
            const userRoomIds = userChatRooms.map(room => room._id);
           
            setUserRooms(userRoomIds);
           
            
        });
        
    },[user])
    
    useEffect(() => {
        // Call fetchChatRoomMessages when the component mounts or when roomId changes
        if(roomId!== null && roomId !== undefined) {
            console.log("CHECK IF I AM  TRIGGERED")
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
          // Make an API request to retrieve messages for the given chat room ID
          const response = await axios.get(`http://localhost:3333/api/chatroom/${roomId}/messages`);
          const messages = response.data;
          setUsersInRoom(response.data?.chatRoomUsers);
          console.log("USERS List =>" , usersInRoom)
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
        console.log("ACTIVE ROOM", userRooms)
        setRoomId(userRooms[0])
        return userRooms.includes(roomId);
      };
    
      const handleLeaveRoom = async (roomId) => {
        try {
          // Send a POST request to leave the chat room
          const response = await axios.post(`http://localhost:3333/api/leave/${roomId}`, user, {
            withCredentials: true,
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
      const handleJoinRoom = async (roomId) => {
        console.log("Join Clicked")
        try {
          // Send a POST request to join the chat room
          const response = await axios.post(`http://localhost:3333/api/join/${roomId}`, user, {
            withCredentials: true, // Send cookies with the request if using cookies for authentication
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
                    handleJoinRoom={handleJoinRoom} 
                    handleLeaveRoom={handleLeaveRoom} 
                    userInRoom={userInRoom}
                    activeRooms={userRooms}
                    setActiveRooms={setActiveRooms}
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
            <ChatInterface messages={messages} chatRoomName={chatRoomName} sendMessage={sendMessage} userDetails={userDetails}/>
        </div>
        <div className='w-[25%] bg-white border border-gray-300 h-screen'>
            <UsersList userList={usersInRoom}/>
        </div>

        <CreateChatRoom isOpen={isModalOpen} closeModal={closeModal} setChatRooms={setChatRooms}/>
    </div>
  )
}
