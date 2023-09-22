// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';

import { Route, Routes, Link } from 'react-router-dom';
import UserRegistrationForm from './userRegistrationForm';

export function App() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 '>
        <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
          <h1 className="text-lg font-mono font-medium text-gray-700 md:text-xl dark:text-white">
          Create account
          </h1>  
          <UserRegistrationForm />
        </div>
        
      </div>
    </div>
    </section>
    
  );
}

export default App;
