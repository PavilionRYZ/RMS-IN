import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "/api/v1"; // Adjust this based on your backend URL

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

// // Update User Credentials (Logged-in User)
// export const updateUserCredentials = createAsyncThunk(
//     "user/updateUserCredentials",
//     async (updateData, { rejectWithValue }) => {
//         try {
//             const token = Cookies.get("token");
//             const response = await axios.patch(
//                 `${API_URL}/updateUserCredentials`,
//                 updateData,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             return response.data.user;
//         } catch (error) {
//             return rejectWithValue(error.response?.data?.message || "Failed to update credentials");
//         }
//     }
// );

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
        // setUser: (state, action) => { // Added: Reducer to set the logged-in user
        //     state.user = action.payload;
        //     state.loading = false;
        //     state.error = null;
        // },
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
            // .addCase(updateUserCredentials.pending, (state) => {
            //     state.loading = true;
            //     state.error = null;
            // })
            // .addCase(updateUserCredentials.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.user = action.payload; // Update the logged-in user's details
            // })
            // .addCase(updateUserCredentials.rejected, (state, action) => {
            //     state.loading = false;
            //     state.error = action.payload;
            // })
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
            });
    },
});

export const { resetUserState, setUser } = userSlice.actions;
export default userSlice.reducer;