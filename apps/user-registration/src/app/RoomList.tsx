import React from 'react';
import useInitials from './hooks/useInitials';
import axios from 'axios';

export default function RoomList({ rooms , handleJoinRoom, userInRoom, handleLeaveRoom, activeRooms,setActiveRooms}) {
  
  const roomList = Array.isArray(rooms) ? rooms : [];
console.log("ACTIVE ROOM =>",activeRooms)
    const roomItems = roomList.map((room, index) => {
        const initials = useInitials(room.name);

        const handleClick = () => {
            if (userInRoom(room._id)) {
              // User is already in the room, so leave it
              handleLeaveRoom(room._id);
              setActiveRooms((prevActiveRooms) => prevActiveRooms.filter((activeRoom) => activeRoom !== room._id));
            } else {
              // User is not in the room, so join it
              handleJoinRoom(room._id);
              setActiveRooms((prevActiveRooms) => [...prevActiveRooms, room._id]);
            }
          };
          const buttonAction = userInRoom(room._id) ? 'Leave' : 'Join';
          const isUserInActiveRoom = activeRooms.length > 0;
          console.log("isUserInActiveRoom =>", isUserInActiveRoom)
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
                className={`inline-flex items-center text-base font-semibold text-gray-900 dark:text-white ${
                    activeRooms.length>0 && !activeRooms.includes(room._id) ? 'text-gray-300' : 'text-gray-900'
                  }`}
                onClick={handleClick}
                disabled={activeRooms.length>0 && !activeRooms.includes(room._id)}
                >
                    {buttonAction}
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

