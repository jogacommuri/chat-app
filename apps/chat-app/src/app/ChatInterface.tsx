import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import useInitials from './hooks/useInitials';


export default function ChatInterface({ messages, chatRoomName, sendMessage, user}) {
    const [messageText, setMessageText] = useState('');
    // const { user } = useUserContext();
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
    const messageContainerRef = useRef(null);
    const messageInputRef = useRef(null);
    const insertTextAtCursor = (textToInsert) => {
        const startPos = messageInputRef.current.selectionStart;
        const endPos = messageInputRef.current.selectionEnd;
        setMessageText(
          messageText.substring(0, startPos) + textToInsert + messageText.substring(endPos)
        );
        messageInputRef.current.focus();
    };

    const formatMessage = (text) => {
        
        // Replace <b>text</b> with <strong>text</strong>
        text = text.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>');
        
        // Replace <i>text</i> with <em>text</em>
        text = text.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>');
        return text;
      };

    const handleMessageSend = (e) => {
        e.preventDefault();
        
      if (messageText.trim() !== '') {
        formatMessage(messageText);
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
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
          }
      }, [messages]);
      useEffect(() => {
        console.log('User state updated from ChatInterface:', user);
      }, [user]);
    return (
        <div className="flex-1 p:2 sm:p-6 flex flex-col font-mono sm:h-screen justify-start">
            <div className="flex flex-col items-center justify-items-start w-full p-4">
                <div className='ml-4'>
                <span className='font-medium font-mono text-gray-600 dark:text-gray-300'>{chatRoomName ? chatRoomName : " Please join a room to start messaging."}</span>
                </div>
            </div>
            <hr />
            <div className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch" ref={messageContainerRef}>
            {messages.length < 1 ? (
            <div>
                Please join a room to start messaging.
            </div>
            ) : 
            (messages.map((message, index) => (
                <div className="chat-message" key={index}>
                    {message.systemMessage ?
                       ( <div className='flex items-center justify-center'>
                            <span className=" space-y-2 text-xs max-w-xs mx-2px-4 py-2 rounded-lg inline-block bg-white-300 text-slate-600 italic" dangerouslySetInnerHTML={{ __html: message.text }}>
                                
                            </span>
                        </div>)
                    : 
                    (<div className={`flex flex-row w-full items-end ${user?._id === message.senderInfo._id ? 'justify-end' : ''}` }>
                        <div className={`flex flex-col space-y-2 text-xs max-w-xs mx-2 ${user?._id === message.senderInfo._id ? 'order-1 items-end' : 'order-2 items-start'}`}>
                            <div>
                            <span className="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600" dangerouslySetInnerHTML={{ __html: message.text }}>
                            
                            </span>
                            </div>
                        </div>
                        <div className={`relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600  ${user?._id === message.senderInfo._id ? 'order-2' : 'order-1'}` }>
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                            {initials[message.senderInfo._id]}
                            </span>
                        </div>
                    </div>)
                    }
                    
                </div>
                ))
            )}
            </div>
                <div className="border-t-2 border-gray-200 p-4 pt-4 mb-2 sm:mb-0">
                    <div className="relative">
                    <form onSubmit={handleMessageSend}>
                        <label htmlFor="chat" className="sr-only">Your message</label>
                        <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700"> 
                        <button
                        type="button"
                        onClick={() => insertTextAtCursor('<b></b>')} // Insert bold tags
                        className="p-2 text-slate-600 hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
                        >
                        <b>B</b>
                        </button>
                        <button
                        type="button"
                        onClick={() => insertTextAtCursor('<i></i>')} // Insert italic tags
                        className="p-2 text-slate-600 hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
                        >
                        <i>I</i>
                        </button>
                        <textarea
                            ref={messageInputRef}
                            id="chat"
                            rows={1}
                            className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3"
                            placeholder="Your message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        ></textarea>
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
