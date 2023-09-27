import axios from 'axios';
import React, { useContext, useState } from 'react'
import Modal from 'react-modal';
import  { useUserContext } from './UserContextProvider';
import { API_BASE_URL } from './api';

export default function CreateChatRoom({ isOpen, closeModal, setChatRooms }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        users: [],
    });
    const inputClass = 'block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-sm border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-slate-600 focus:outline-none focus:ring-0 focus:border-slate-200 peer';
    const labelClass = 'absolute text-sm tracking-wide text-neutral-400 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-slate-600 peer-focus:font-bold peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1'
    const { user } = useUserContext();
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        formData.users.push(user)
       
        try {
          const response = await axios.post(`${API_BASE_URL}/api/chatrooms`,  formData,{withCredentials:true});
          // Handle the response here, e.g., update state or show a success message
          
          setChatRooms(response.data)
          setChatRooms((prevChatRooms) => [...prevChatRooms, response.data]);
        } catch (error) {
          // Handle errors, e.g., display an error message to the user
          console.error('Error creating chat room:', error);
        }
        closeModal();
    };
  return (
    
      
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="modal font-mono fixed inset-0 flex items-center justify-center top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
      overlayClassName="overlay"
    >
        <div className="overlay bg-black opacity-50 absolute inset-0"></div>
        <div className="modal-content relative w-full max-w-md max-h-full bg-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold">Create a Chat Room</h2>
                <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                </button>
            </div>
            <form className="mt-6 grid gap-4 lg:gap-6 " onSubmit={handleSubmit}>
                <div className="relative">
                    <label htmlFor='chat-room-name' className={labelClass}>Name:</label>
                    <input
                        id="chat-room-name"
                        type="text"
                        name="name"
                        className={inputClass}
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="relative">
                    <label htmlFor='chat-room-desc' className={labelClass}>Description:</label>
                    <textarea
                        id="chat-room-desc"
                        className={inputClass}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>
                <button className='bg-slate-600 w-ful text-white px-4 py-2 rounded' type="submit">Create</button>
            </form>
        </div>
    </Modal>

  )
}
