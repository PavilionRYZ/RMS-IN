import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`; // Adjust this based on your backend URL

const initialState = {
  inventory: {
    inventoryItems: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
  },
  inventoryItem: null,
  loading: false,
  error: null,
};

export const createInventoryItem = createAsyncThunk(
  "inventory/createInventoryItem",
  async (item, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/inventory/create`, item);
      return response.data.inventoryItem;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getInventoryItems = createAsyncThunk(
  "inventory/getInventoryItems",
  async (params, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/inventory/items`, { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getInventoryItemDetails = createAsyncThunk(
  "inventory/getInventoryItemDetails",
  async (itemId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/inventory/item/${itemId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const addStock = createAsyncThunk(
  "inventory/addStock",
  async (item, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/inventory/add-stock`, item);
      return response.data.inventoryItem;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const stockUse = createAsyncThunk(
  "inventory/useStock",
  async (item, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/inventory/use-stock`, item);
      return response.data.inventoryItem;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  "inventory/deleteInventoryItem",
  async (itemId, thunkAPI) => {
    try {
      const response = await axios.delete(`${API_URL}/inventory/item/delete/${itemId}`);
      return { _id: itemId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearInventoryState: (state) => {
      state.inventory = { inventoryItems: [], totalItems: 0, totalPages: 0, currentPage: 1 };
      state.inventoryItem = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory.inventoryItems.push(action.payload);
        state.inventory.totalItems += 1;
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getInventoryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = {
          inventoryItems: action.payload.inventoryItems,
          totalItems: action.payload.totalItems,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
        };
      })
      .addCase(getInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getInventoryItemDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryItemDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryItem = action.payload.inventoryItem;
      })
      .addCase(getInventoryItemDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStock.fulfilled, (state, action) => {
        state.loading = false;
        const existingItemIndex = state.inventory.inventoryItems.findIndex(
          (item) => item._id === action.payload._id
        );
        if (existingItemIndex >= 0) {
          state.inventory.inventoryItems[existingItemIndex] = action.payload;
        } else {
          state.inventory.inventoryItems.push(action.payload);
          state.inventory.totalItems += 1;
        }
      })
      .addCase(addStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(stockUse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stockUse.fulfilled, (state, action) => {
        state.loading = false;
        const itemIndex = state.inventory.inventoryItems.findIndex(
          (item) => item._id === action.payload._id
        );
        if (itemIndex >= 0) {
          state.inventory.inventoryItems[itemIndex] = action.payload;
        }
      })
      .addCase(stockUse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory.inventoryItems = state.inventory.inventoryItems.filter(
          (item) => item._id !== action.payload._id
        );
        state.inventory.totalItems -= 1;
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInventoryState } = inventorySlice.actions;
export default inventorySlice.reducer;