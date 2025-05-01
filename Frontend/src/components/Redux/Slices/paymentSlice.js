import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/payments`;

export const createPayment = createAsyncThunk(
  "payment/createPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, paymentData, { withCredentials: true });
      return response.data.payment;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to create payment" });
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "payment/updatePaymentStatus",
  async ({ paymentId, payment_status, payment_method }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${paymentId}`, { payment_status, payment_method }, { withCredentials: true });
      return response.data.payment;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to update payment status" });
    }
  }
);

export const getPaymentsByOrder = createAsyncThunk(
  "payment/getPaymentsByOrder",
  async ({ orderId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/order/${orderId}`, { params: { page, limit }, withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to get payments by order" });
    }
  }
);

export const refundPayment = createAsyncThunk(
  "payment/refundPayment",
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/refund/${paymentId}`, {}, { withCredentials: true });
      return response.data.payment;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to refund payment" });
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    payments: [],
    totalPayments: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearPaymentState: (state) => {
      state.payments = [];
      state.totalPayments = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.push(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        } else {
          state.payments.push(action.payload);
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPaymentsByOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentsByOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments || [];
        state.totalPayments = action.payload.total || 0;
      })
      .addCase(getPaymentsByOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refundPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(refundPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;