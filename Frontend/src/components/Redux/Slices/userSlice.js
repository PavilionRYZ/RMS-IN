import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`; // Adjust this based on your backend URL

// Fetch all users (Admin Only)
export const fetchAllUsers = createAsyncThunk(
    "user/fetchAllUsers",
    async (_, { rejectWithValue }) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${API_URL}/getAllUsers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.users;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
        }
    }
);

// Update user by id (Admin Only)
export const updateUser = createAsyncThunk(
    "user/updateUser",
    async (updateData, { rejectWithValue }) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.patch(
                `${API_URL}/updateUser/${updateData.userId}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update user");
        }
    }
);

// Register User (Admin Only)
export const registerUser = createAsyncThunk(
    "user/registerUser",
    async (userData, { rejectWithValue }) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.post(`${API_URL}/createUser/new`, userData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to register user");
        }
    }
);

// Delete User (Admin Only)
export const deleteUser = createAsyncThunk(
    "user/deleteUser",
    async (userId, { rejectWithValue }) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.delete(`${API_URL}/deleteUser/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data; // Return the deleted user's ID
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete user");
        }
    }
);


const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        users: [],
        loading: false,
        error: null,
    },
    reducers: {
        resetUserState: (state) => {
            state.user = null;
            state.users = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users.push(action.payload);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex((user) => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.user?._id === action.payload._id) {
                    state.user = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter((user) => user._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;