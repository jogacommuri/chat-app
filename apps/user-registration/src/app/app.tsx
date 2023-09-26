// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';

import UserRegistrationForm from './userRegistrationForm';
import UserContext from './UserContext'
import { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginComponent from './Login'; // Import your Login component
import Header from './header';
import ChatComponent from './ChatComponent';
import axios from 'axios';


export function App() {
  const [user, setUser] =  useState('');
  // const user1 = useContext(UserContext);
  useEffect(() =>{
    console.log("In useEffect app.tsx")
    axios.get("http://localhost:3333/api/user", {withCredentials:true})
    .then(res => setUser(res.data))
  },[])
  return (
  
      <UserContext.Provider value={{ ...user, setUser }}>
        <div className="w-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <h1 className="text-lg font-mono font-medium text-gray-700 md:text-xl dark:text-white">ChatRoom</h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between px-6 py-8 mx-auto md:h-screen lg:py-0">
                {/* <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 '>
                
                  <div className='p-6 space-y-4 md:space-y-6 sm:p-8'> */}
                    <Routes>
                    <Route path="/" element={<ChatComponent />} />
                      <Route path="/login" element={<LoginComponent />} />
                      <Route path="/register" element={<UserRegistrationForm />} />
                    </Routes>
                  {/* </div>  
                </div> */}
              </div>
            </div>
          </main>
        </div>
      </UserContext.Provider>
  
  );
}

export default App;
