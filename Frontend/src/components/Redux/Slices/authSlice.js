import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// import Cookies from "js-cookie";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`; // Adjust this based on your backend URL

// Login user
export const login = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials, {
                withCredentials: true
            });
            // Cookies.set("token", response.data.token);
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
            await axios.post(`${API_URL}/logout`, {}, {
                withCredentials: true // ✅ necessary
            });
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Logout failed");
        }
    }
);


export const forgotPassword = createAsyncThunk(
    "auth/forgotPassword",
    async (email, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/forgotPassword`, { email });
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to send OTP");
        }
    }
);

export const verifyOTP = createAsyncThunk(
    "auth/verifyOTP",
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/verifyOTP`, { email, otp });
            return {
                message: response.data.message,
                resetToken: response.data.resetToken, // Assuming the backend returns a reset token
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to verify OTP");
        }
    }
);

export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async ({ email, newPassword, resetToken }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/resetPassword`, {
                email,
                newPassword,
                resetToken,
            });
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to reset password");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
    },
    reducers: {
        clearAuthState: (state) => {
            state.error = null;
            state.message = null;
            state.loading = false;
        },
        clearCookies(state) {
            state.user = null;
            state.loading = false;
            state.error = null;
            state.isAuthenticated = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.loading = false;
                state.error = null;
                state.message = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(verifyOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
                state.resetToken = action.payload.resetToken; // Store the reset token in the state
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearAuthState, clearCookies } = authSlice.actions;
export default authSlice.reducer;