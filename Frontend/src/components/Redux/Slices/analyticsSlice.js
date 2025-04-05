import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    analytics: [],
    loading: false,
    error: null,
};

export const getAnalytics = createAsyncThunk(
    "analytics/getAnalytics",
    async ({ startDate, endDate, type }, thunkAPI) => {
        try {
            const response = await axios.get("/api/v1/analytics", {
                params: { startDate, endDate, type },
            });
            return response.data.analytics;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const computeDailyAnalytics = createAsyncThunk(
    "analytics/computeDailyAnalytics",// identifier
    async ({ date }, thunkAPI) => {
        try {
            const response = await axios.get("/api/v1/analytics/daily", {
                params: { date },
            });
            return response.data.analytics;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

const analyticsSlice = createSlice({
    name: "analytics",
    initialState,
    reducers: {
        clearAnalyticsState: (state) => {
            state.analytics = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            .addCase(getAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // computeDailyAnalytics
            .addCase(computeDailyAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(computeDailyAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            .addCase(computeDailyAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearAnalyticsState } = analyticsSlice.actions;
export default analyticsSlice.reducer;