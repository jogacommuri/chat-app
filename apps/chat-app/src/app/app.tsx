import React, { useEffect, useState } from 'react';
import { BrowserRouter, useNavigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';

import Header from './Navigation';
import ChatComponent from './ChatComponent';
import LoginComponent from './Login';
import UserRegistrationForm from './RegistrationForm';
import Cookies from "js-cookie";
import { API_BASE_URL } from './api';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
   
    const authToken = getAuthTokenFromCookie();
    if (authToken) {
      
      axios.get(`${API_BASE_URL}/api/user`, { withCredentials: true,headers: {
        Authorization: `${authToken}`,
      }, })
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          setLoading(false);
          navigate('/login')
        });
      } else{
        console.error('Error fetching user data: token not present');
        setLoading(false);
        navigate('/login');
      }
  }, []);

  useEffect(() => {
    const authToken = getAuthTokenFromCookie();
    console.log('1 => User state updated in app:', user);
    if(authToken && !user){
      const userDetails = JSON.parse(Cookies.get("userData"));
      setUser(userDetails)
    }
  }, [user]);
  useEffect(() => {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyB6fVZaZEL8YuD3dJUes9az4M2uXYaBpto",
      authDomain: "chat-messaging-fe7bb.firebaseapp.com",
      projectId: "chat-messaging-fe7bb",
      storageBucket: "chat-messaging-fe7bb.appspot.com",
      messagingSenderId: "967172716397",
      appId: "1:967172716397:web:c17bc767591183c7d80c64",
      measurementId: "G-NWBJMC3CZP"
    };
    const firebaseApp = initializeApp(firebaseConfig);

    // Request notification permission
    const messaging = getMessaging(firebaseApp);

    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          // Permission granted, get the FCM token
          return getToken(messaging);
        } else if (permission === 'denied') {
          console.error('Notification permission denied.');
          // Handle permission denied
        } else {
          console.error('Notification permission request ignored.');
          // Handle permission request ignored
        }
      }).then((token) => {
        if (token) {
          console.log('FCM Token:', token);
          // Send this token to your server to associate with the user.
        }
      }).catch((error) => {
        console.error('Error requesting notification permission:', error);
      });
    }
  }, []);
  const getAuthTokenFromCookie = () => {
    
    
    return Cookies.get("token");
  };
  return (
   
      <div className="w-screen bg-gray-50 dark:bg-gray-900">
        {loading ? (
          // Render a loading indicator or placeholder component here
          <div>Loading...</div>
        ) : (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
          {user ? (
            <>
            <Header user={user}/>
            {/* <header className="bg-white shadow">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-lg font-mono font-medium text-gray-700 md:text-xl dark:text-white">ChatRoom</h1>
              </div>
            </header> */}
            
            </>
            ): null}
            <main>
              <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between px-6 py-8 mx-auto md:h-screen lg:py-0">
                  <Routes>
                    <Route path="/" element={<ChatComponent user={user} />} />
                    <Route path="/login" element={<LoginComponent />} />
                    <Route path="/register" element={<UserRegistrationForm />} />
                  </Routes>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    
  );
}

export default App;
