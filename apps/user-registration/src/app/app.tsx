import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import UserContextProvider from './UserContextProvider';
import Header from './Navigation';
import ChatComponent from './ChatComponent';
import LoginComponent from './Login';
import UserRegistrationForm from './RegistrationForm';

export function App() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("In useEffect app.tsx");
    axios.get("http://localhost:3333/api/user", { withCredentials: true })
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log('User state updated:', user);
  }, [user]);

  return (
    <UserContextProvider>
      <div className="w-screen bg-gray-50 dark:bg-gray-900">
        {loading ? (
          // Render a loading indicator or placeholder component here
          <div>Loading...</div>
        ) : (
          <>
            <Header userDetails={user}/>
            <header className="bg-white shadow">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-lg font-mono font-medium text-gray-700 md:text-xl dark:text-white">ChatRoom</h1>
              </div>
            </header>
            <main>
              <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between px-6 py-8 mx-auto md:h-screen lg:py-0">
                  <Routes>
                    <Route path="/" element={<ChatComponent userDetails={user}/>} />
                    <Route path="/login" element={<LoginComponent />} />
                    <Route path="/register" element={<UserRegistrationForm />} />
                  </Routes>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </UserContextProvider>
  );
}

export default App;
