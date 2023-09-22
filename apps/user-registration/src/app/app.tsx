// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';

import UserRegistrationForm from './userRegistrationForm';
import UserContext from './UserContext'
import { useContext, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginComponent from './Login'; // Import your Login component


export function App() {
  const [user, setUser] =  useState('');
  // const user1 = useContext(UserContext);
  return (
  
      <UserContext.Provider value={{ ...user, setUser }}>
        <section className="bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 '>
              <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
                <Routes>
                  <Route path="/login" element={<LoginComponent />} />
                  <Route path="/" element={<UserRegistrationForm />} />
                </Routes>
              </div>  
            </div>
          </div>
        </section>
      </UserContext.Provider>
  
  );
}

export default App;
