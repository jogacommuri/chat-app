import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';
import { UserContextProvider } from './app/UserContextProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <UserContextProvider>
        <App />
        </UserContextProvider>
    </BrowserRouter>
  </StrictMode>
);
