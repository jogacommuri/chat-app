import React, { useContext, useEffect, useMemo, useState } from 'react'
import useInitials from './hooks/useInitials';
import UserContext from './userContext';

export default function ChatInterface({ messages, chatRoomName, sendMessage }) {
    const [messageText, setMessageText] = useState('');
    const user = useContext(UserContext);
    console.log("USer from interface", user);

    const handleMessageSend = (e) => {
        e.preventDefault();
        console.log('handleMessageSend called'); // Add this line
      if (messageText.trim() !== '') {
        sendMessage(messageText);
        setMessageText('');
      }
    };
    const initials = useMemo(() => {
        const initialsObj = {};
        messages.forEach((message) => {
            let senderId;

            if (typeof message.senderInfo === 'string') {
            senderId = message.senderInfo;
            } else if (typeof message.senderInfo === 'object') {
            senderId = message.senderInfo._id;
            } else {
            return;
            }
          
          if (!initialsObj[senderId]) {
            initialsObj[senderId] = useInitials(
              `${message.senderInfo.firstName} ${message.senderInfo.lastName}`
            );
          }
        });
        return initialsObj;
    }, [messages]);

    useEffect(() => {
        // You can access the initials object here if needed
        console.log(initials);
      }, [initials]);
    return (
        <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen">
            <div className="flex flex-col items-center justify-items-start w-full p-4">
                <div className='ml-4'>
                    <span className='font-medium font-mono text-gray-600 dark:text-gray-300'>{chatRoomName}</span>
                </div>
            </div>
            <hr></hr>
            <div className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
            {messages.map((message, index) => (
            <div className="chat-message" key={index}>
                <div className={`flex flex-row w-full items-end ${user?._id === message.senderInfo._id ? 'justify-end' : ''}` }>
                <div className={`flex flex-col space-y-2 text-xs max-w-xs mx-2 ${user?._id === message.senderInfo._id ? 'order-1 items-end' : 'order-2 items-start'}`}>
                    <div>
                    <span className="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600">
                        {message.text}
                    </span>
                    </div>
                </div>
                <div className={`relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600  ${user?._id === message.senderInfo._id ? 'order-2' : 'order-1'}` }>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                    {initials[message.senderInfo._id]}
                    </span>
                </div>
                </div>
            </div>
            ))}
            </div>
            <div className="border-t-2 border-gray-200 p-4 pt-4 mb-2 sm:mb-0">
                <div className="relative">

                    <form onSubmit={handleMessageSend}>
                        <label htmlFor="chat" className="sr-only">Your message</label>
                        <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700"> 
                            <textarea id="chat" 
                            rows="1" 
                            className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3" 
                            placeholder="Your message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}    >
                            </textarea>
                            <button type="submit" className="inline-flex justify-center p-2 text-slate-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600" >
                                <svg className="w-5 h-5 rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                    <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"/>
                                </svg>
                                <span className="sr-only">Send message</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
