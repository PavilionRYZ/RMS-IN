import { configureStore } from '@reduxjs/toolkit';
import {thunk }from 'redux-thunk';

// Import Reducers here
import { userReducer } from './Reducers/usrReducer';


const initialState = {
    auth: { isAuthenticated: false },
    // Add other initial states here
};

// Combine reducers (you can add more as needed)
const rootReducer = {
    // Add other reducers here
    user: userReducer,
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(thunk), // Add thunk middleware
    preloadedState: initialState,
    devTools: true, // Enables Redux DevTools automatically in development
});

export default store;