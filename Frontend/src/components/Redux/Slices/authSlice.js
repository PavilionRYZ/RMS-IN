import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "/api/v1";

// Login user
export const login = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            Cookies.set("token", response.data.token);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Login failed");
        }
    }

);

// Logout user
export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await axios.post(`${API_URL}/logout`);
            Cookies.remove("token");
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Logout failed");
        }
    }
);

// Update User Credentials (Logged-in User)
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

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        error: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
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
        // });

    },
});

export default authSlice.reducer;