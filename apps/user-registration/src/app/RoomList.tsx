import React from 'react';
import useInitials from './hooks/useInitials';
import axios from 'axios';

export default function RoomList({ rooms }) {
  
  const roomList = Array.isArray(rooms) ? rooms : [];

    const roomItems = roomList.map((room, index) => {
        const initials = useInitials(room.name);

        const handleJoinRoom = async () => {
            console.log("Join Clicked")
            try {
              // Send a POST request to join the chat room
              const response = await axios.post(`http://localhost:3333/api/join/${room._id}`, null, {
                withCredentials: true, // Send cookies with the request if using cookies for authentication
              });
      
              if (response.status === 200) {
                // Successfully joined the chat room
                // You can implement the logic to navigate to the chat room or show a success message here
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
        <li key={index} className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                <span className="font-medium text-gray-600 dark:text-gray-300">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                {room.name}
                </p>
                <p className="text-xs font-sm text-gray-500 whitespace-normal truncate dark:text-white">
                {room.description}
                </p>
                <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                {room.users.length} users online
                </p>
            </div>
            <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                <button
                className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
                onClick={handleJoinRoom}
                >
                    Join
                </button>
            </div>
            </div>
        </li>
        );
    });
  return (
    <div className="w-full font-mono max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-center">
        <h5 className="text-xl leading-none text-gray-900 dark:text-white">Available Rooms</h5>
      </div>
      <div className="flex py-5">
        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
          {roomItems}
        </ul>
      </div>
      
      
    </div>
  );
}

