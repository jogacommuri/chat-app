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
import { useUserContext } from './UserContextProvider';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function App() {
  // const [user, setUser] = useState<User | null>(null);
  const { user, setUser } = useUserContext();
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
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0 text-center">
              <div className="text-center">
                <svg aria-hidden="true" className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                  <span className="sr-only">Loading...</span>
              </div>
          </div>
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
