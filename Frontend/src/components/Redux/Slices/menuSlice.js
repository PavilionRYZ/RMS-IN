import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const initialState = {
    menu: [],
    menuItem: null,
    loading: false,
    error: null,
};

export const getMenuItems = createAsyncThunk(
    "menu/getMenuItems",
    async (queryParams, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/get/all/menu/items`, {
                params: queryParams,
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to fetch menu items" });
        }
    }
);

export const getMenuItem = createAsyncThunk(
    "menu/getMenuItemById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/get/menu/item/${id}`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to fetch menu item" });
        }
    }
);

export const editMenuItem = createAsyncThunk(
    "menu/editMenuItem",
    async (menuItem, { rejectWithValue }) => {
        try {
            const response = await axios.patch(
                `${API_URL}/edit/menu/item/${menuItem._id}`,
                menuItem,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to update menu item" });
        }
    }
);

export const deleteMenuItem = createAsyncThunk(
    "menu/deleteMenuItem",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${API_URL}/delete/menu/item/${id}`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to delete menu item" });
        }
    }
);

export const createMenuItem = createAsyncThunk(
    "menu/createMenuItem",
    async (menuItem, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/create/menu/item`, menuItem, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to create menu item" });
        }
    }
);

const menuSlice = createSlice({
    name: "menu",
    initialState,
    reducers: {
        resetMenu: (state, action) => {
            state.menu = action.payload;
        },
        resetMenuItem: (state) => {
            state.menuItem = null;
        },
        clearMenuState: (state) => {
            state.menu = [];
            state.menuItem = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMenuItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMenuItems.fulfilled, (state, action) => {
                state.loading = false;
                state.menu = action.payload.menuItems || [];
                state.totalItems = action.payload.totalItems || 0;
            })
            .addCase(getMenuItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getMenuItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMenuItem.fulfilled, (state, action) => {
                state.loading = false;
                state.menuItem = action.payload.menuItem;
            })
            .addCase(getMenuItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(editMenuItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(editMenuItem.fulfilled, (state, action) => {
                state.loading = false;
                state.menuItem = action.payload.menuItem;
            })
            .addCase(editMenuItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteMenuItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteMenuItem.fulfilled, (state, action) => {
                state.loading = false;
                state.menu = state.menu.filter((item) => item._id !== action.meta.arg);
            })
            .addCase(deleteMenuItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createMenuItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createMenuItem.fulfilled, (state, action) => {
                state.loading = false;
                state.menuItem = action.payload.menuItem;
                state.menu.push(action.payload.menuItem);
            })
            .addCase(createMenuItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetMenu, resetMenuItem, clearMenuState } = menuSlice.actions;

export default menuSlice.reducer;