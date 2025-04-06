// src/redux/slices/analyticsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchAnalytics = createAsyncThunk(
    'analytics/fetchAnalytics',
    async ({ period, startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/v1/analytics', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { period, startDate, endDate }
            });
            return response.data.data[0];
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const generateAnalytics = createAsyncThunk(
    'analytics/generateAnalytics',
    async ({ period, startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/v1/generate-analytics',
                { period, startDate, endDate },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState: {
        data: null,
        period: 'monthly',
        startDate: '',
        endDate: '',
        loading: false,
        error: null,
    },
    reducers: {
        setPeriod: (state, action) => {
            state.period = action.payload;
        },
        setStartDate: (state, action) => {
            state.startDate = action.payload;
        },
        setEndDate: (state, action) => {
            state.endDate = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch analytics';
            })
            .addCase(generateAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(generateAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to generate analytics';
            });
    },
});

export const { setPeriod, setStartDate, setEndDate, clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;