import React from 'react'
import useInitials from './hooks/useInitials';

export default function UsersList(userList) {
    const userLists = Array.isArray(userList.userList) ? userList.userList : [];
    // console.log("LIST FROM ListBulletIcon", userList.userList);

    const userItem = userLists.map((user, index) => {
        const initials = useInitials(`${user.firstName} ${user.lastName}`);

        return (
        <li key={index} className="px-2">
            <div className="flex items-center space-x-4">
                <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full dark:bg-gray-600">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                    {user.firstName} {user.lastName}
                    </p>
                </div>
            </div>
        </li>
        );
    });
  return (
    <div className="w-full font-mono max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-center">
        <h5 className="text-xl leading-none text-gray-900 dark:text-white">Active Users</h5>
      </div>
     
      <div className="flex py-5">
        <ul role="list" className="">
          {userItem}
        </ul>
      </div>
      
      
    </div>
  )
}
