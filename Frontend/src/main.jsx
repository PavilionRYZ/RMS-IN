import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import {store} from './components/Redux/Store.js'
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from 'redux-persist'
import axios from "axios";
import SetupInterceptors from './setupInterceptors.jsx';
axios.defaults.withCredentials = true;

const persistor = persistStore(store);
createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Provider store={store}>
   <PersistGate loading={null} persistor={persistor}> 
      <App />
      <SetupInterceptors />
  </PersistGate>
    </Provider> 
  </StrictMode>
)
