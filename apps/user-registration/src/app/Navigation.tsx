import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from './UserContextProvider';
import useInitials from './hooks/useInitials';

export default function Header(userDetails) {
//   const { user } = useUserContext();
//   console.log("USER =>", user);
    const user = userDetails.userDetails;
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const userInitials = useInitials(userName);
  useEffect(() => {
    console.log('User state updated from HEader:', userDetails);
  }, [user]);

  return (
    <div>
      <nav className="bg-white border border-gray-200 dark:bg-gray-900">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
          <a href="https://flowbite.com" className="flex items-center">
            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 mr-3" alt="Flowbite Logo" />
            <span className="self-center text-lg font-mono font-medium text-gray-700 md:text-xl dark:text-white">Chat App</span>
          </a>
          {!user ? (
            <div className="flex-col items-center">
              <Link to="/login" className="font-medium text-sky-600 hover:underline dark:text-sky-500 p-4">Login </Link>
              <Link to="/register" className="font-medium text-sky-600 hover:underline dark:text-sky-500 p-4">Register </Link>
            </div>
          ) : (
            <div className='flex items-center justify-center p-5 '>
              <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                <span className="font-medium text-gray-600 dark:text-gray-300">{userInitials}</span>
              </div>
              <div className='ml-4'>
                <span className='font-medium font-mono text-gray-600 dark:text-gray-300'>{userName}</span>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
