import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const initialState = {
  reservations: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
};

// Create Reservation
export const createReservation = createAsyncThunk(
  "reservation/createReservation",
  async (reservationData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/reservations`, reservationData);
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
      const response = await axios.patch(`${API_URL}/reservations/${reservationId}`, updateData);
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
      const response = await axios.delete(`${API_URL}/reservations/${reservationId}`);
      return response.data.reservation;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || "Failed to cancel reservation");
    }
  }
);

// Get All Reservations with Pagination
export const getAllReservations = createAsyncThunk(
  "reservation/getAllReservations",
  async (params, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/reservations/all`, { params });
      return {
        reservations: response.data.reservations,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || "Failed to fetch reservations");
    }
  }
);

// Get Reservations by Customer Name with Pagination
export const getReservationsByCustomerName = createAsyncThunk(
  "reservation/getReservationsByCustomerName",
  async (params, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/reservations/customer`, { params });
      return {
        reservations: response.data.reservations,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      };
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
      state.total = 0;
      state.page = 1;
      state.limit = 10;
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
        state.total += 1;
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
        state.reservations = action.payload.reservations;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
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
        state.reservations = action.payload.reservations;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(getReservationsByCustomerName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReservationState } = reservationSlice.actions;
export default reservationSlice.reducer;