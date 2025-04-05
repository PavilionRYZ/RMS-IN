import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from "./Slices/authSlice";
import menuReducer from "./Slices/menuSlice";
import orderReducer from "./Slices/orderSlice";
import userReducer from "./Slices/userSlice";
import cartReducer from "./Slices/cartSlice";
import paymentReducer from "./Slices/paymentSlice";
import inventoryReducer from "./Slices/inventorySlice";
import analyticsReducer from "./Slices/analyticsSlice";
import staffManagementReducer from "./Slices/staffManagementSlice";

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
};

const rootReducer = combineReducers({
    auth: authReducer,
    menu: menuReducer,
    order: orderReducer, 
    user: userReducer,
    cart: cartReducer,
    payment: paymentReducer,
    inventory: inventoryReducer,
    analytics: analyticsReducer,
    staffManagement: staffManagementReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export default store;
