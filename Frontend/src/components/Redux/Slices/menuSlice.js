import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    menu: [],
    menuItem: null,
    loading: false,
    error: null,
};

export const getMenuItems = createAsyncThunk(
    "menu/getMenuItems",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get("/api/v1/get/all/menu/items");
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const getMenuItem = createAsyncThunk("menu/getMenuItemById",
    async (id, thunkAPI) => {
        try {
            const response = await axios.get(`/api/v1/get/menu/item/${id}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const editMenuItem = createAsyncThunk("menu/editMenuItem",
    async (menuItem, thunkAPI) => {
        try {
            const response = await axios.patch(`/api/v1/edit/menu/item/${menuItem._id}`, menuItem);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const deleteMenuItem = createAsyncThunk("menu/deleteMenuItem",
    async (id, thunkAPI) => {
        try {
            const response = await axios.delete(`/api/v1/delete/menu/item/${id}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const createMenuItem = createAsyncThunk("menu/createMenuItem",
    async (menuItem, thunkAPI) => {
        try {
            const response = await axios.post("/api/v1/create/menu/item", menuItem);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

const menuSlice = createSlice({
    name: "menu",
    initialState,
    reducers: {
        resetMenu: (state, action) => {
            state.menu = action.payload;
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
                state.menu = action.payload.menuItems || [];;
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
                state.menuItem = action.payload;
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
                state.menuItem = action.payload;
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
                state.menuItem = action.payload;
                
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
                state.menuItem = action.payload;
            })
            .addCase(createMenuItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },

});

export const { resetMenu } = menuSlice.actions;

export default menuSlice.reducer;