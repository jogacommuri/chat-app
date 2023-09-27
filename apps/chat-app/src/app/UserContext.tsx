import React, { createContext, ReactNode, useContext, useState } from 'react';

// Define the user object type
interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Define the context type
interface UserContextType {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

// Create the initial context value
const initialUserContextValue: UserContextType = {
  user: null,
  setUser: () => {},
};

// Create the context
const UserContext = createContext<UserContextType>(initialUserContextValue);

// Custom hook for using the user context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};

// Create the UserContextProvider component
export const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
