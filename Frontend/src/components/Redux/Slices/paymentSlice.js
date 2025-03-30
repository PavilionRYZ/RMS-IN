import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/v1/payments";

export const createPayment = createAsyncThunk(
    "createPayment",
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_URL, paymentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data || "Failed to create payment");
        }
    }
);

export const updatePaymentStatus = createAsyncThunk(
    "updatePaymentStatus",
    async ({ paymentId, payment_status, payment_method }, { rejectWithValue }) => {
      try {
        const response = await axios.patch(`${API_URL}/${paymentId}`, { payment_status, payment_method });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response.data || "Failed to update payment status");
      }
    }
  );
export const getPaymentsByOrder = createAsyncThunk(
    "getPaymentsByOrder",
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/order/${orderId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data || "Failed to get payments by order");
        }
    }
);

export const refundPayment = createAsyncThunk(
    "refundPayment",
    async (paymentId, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/refund/${paymentId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data || "Failed to refund payment");
        }
    }
);

const paymentSlice = createSlice({
    name: "payment",
    initialState: {
        payments: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearPaymentState: (state) => {
            state.payments = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // createPayment
            .addCase(createPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.payments.push(action.payload.payment);
            })
            .addCase(createPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // updatePaymentStatus
            .addCase(updatePaymentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePaymentStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = state.payments.map((payment) =>
                    payment._id === action.payload.payment._id ? action.payload.payment : payment
                );
            })
            .addCase(updatePaymentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // getPaymentsByOrder
            .addCase(getPaymentsByOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPaymentsByOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload.payments;
            })
            .addCase(getPaymentsByOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // refundPayment
            .addCase(refundPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refundPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = state.payments.map((payment) =>
                    payment._id === action.payload.payment._id ? action.payload.payment : payment
                );
            })
            .addCase(refundPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;