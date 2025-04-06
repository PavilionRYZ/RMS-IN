import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    reservations: [],
    loading: false,
    error: null,
};

// Create Reservation
export const createReservation = createAsyncThunk(
    "reservation/createReservation",
    async (reservationData, thunkAPI) => {
        try {
            const response = await axios.post("/api/v1/reservations", reservationData);
            return response.data.reservation;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || "Failed to create reservation");
        }
    }
);

// Update Reservation
export const updateReservation = createAsyncThunk(
    "reservation/updateReservation",
    async ({ reservationId, updateData }, thunkAPI) => {
        try {
            const response = await axios.patch(`/api/v1/reservations/${reservationId}`, updateData);
            return response.data.reservation;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || "Failed to update reservation");
        }
    }
);

// Cancel Reservation
export const cancelReservation = createAsyncThunk(
    "reservation/cancelReservation",
    async (reservationId, thunkAPI) => {
        try {
            const response = await axios.delete(`/api/v1/reservations/${reservationId}`);
            return response.data.reservation;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || "Failed to cancel reservation");
        }
    }
);

// Get All Reservations (Admin only)
export const getAllReservations = createAsyncThunk(
    "reservation/getAllReservations",
    async (params, thunkAPI) => {
        try {
            const response = await axios.get("/api/v1/reservations/all", { params });
            return response.data.reservations;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || "Failed to fetch reservations");
        }
    }
);

// Get Reservations by Customer Name
export const getReservationsByCustomerName = createAsyncThunk(
    "reservation/getReservationsByCustomerName",
    async (params, thunkAPI) => {
        try {
            const response = await axios.get("/api/v1/reservations/customer", { params });
            return response.data.reservations;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message || "Failed to fetch reservations");
        }
    }
);

const reservationSlice = createSlice({
    name: "reservation",
    initialState,
    reducers: {
        clearReservationState: (state) => {
            state.reservations = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createReservation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createReservation.fulfilled, (state, action) => {
                state.loading = false;
                state.reservations.push(action.payload);
            })
            .addCase(createReservation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateReservation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateReservation.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.reservations.findIndex((r) => r._id === action.payload._id);
                if (index !== -1) {
                    state.reservations[index] = action.payload;
                }
            })
            .addCase(updateReservation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(cancelReservation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelReservation.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.reservations.findIndex((r) => r._id === action.payload._id);
                if (index !== -1) {
                    state.reservations[index] = action.payload;
                }
            })
            .addCase(cancelReservation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getAllReservations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllReservations.fulfilled, (state, action) => {
                state.loading = false;
                state.reservations = action.payload;
            })
            .addCase(getAllReservations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getReservationsByCustomerName.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getReservationsByCustomerName.fulfilled, (state, action) => {
                state.loading = false;
                state.reservations = action.payload;
            })
            .addCase(getReservationsByCustomerName.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearReservationState } = reservationSlice.actions;
export default reservationSlice.reducer;