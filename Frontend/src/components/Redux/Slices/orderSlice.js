import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/order`;

export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, orderData, { withCredentials: true });
      return response.data.order || response.data.data?.order;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to place order" });
    }
  }
);

export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/getAll`, { params: queryParams, withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch orders" });
    }
  }
);

export const getOrderById = createAsyncThunk(
  "order/getOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${orderId}`, { withCredentials: true });
      return response.data.order || response.data.data?.order;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Order not found" });
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${orderId}`, { status }, { withCredentials: true });
      return response.data.order || response.data.data?.order;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to update order status" });
    }
  }
);

export const addToOrder = createAsyncThunk(
  "order/addToOrder",
  async ({ orderId, items }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/add/${orderId}`, { items }, { withCredentials: true });
      return response.data.order || response.data.data?.order;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to add items to order" });
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    order: null,
    totalOrders: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearOrderState: (state) => {
      state.orders = [];
      state.order = null;
      state.totalOrders = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.total;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(addToOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;