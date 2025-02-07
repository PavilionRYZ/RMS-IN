import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
    try {
        const response = await axios.post("/api/user/login", credentials);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
    try {
        await axios.post("/api/user/logout");
        return null;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
            });
    },
});

export default authSlice.reducer;