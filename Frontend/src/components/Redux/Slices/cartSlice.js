import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [], // Array of { menu_item: id, quantity: number }
  },
  reducers: {
    addToCart: (state, action) => {
      const { menu_item, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.menu_item === menu_item);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ menu_item, quantity });
      }
    },
    updateQuantity: (state, action) => {
      const { menu_item, quantity } = action.payload;
      const item = state.items.find((item) => item.menu_item === menu_item);
      if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.menu_item !== menu_item);
        }
      }
    },
    removeFromCart: (state, action) => {
      const menu_item = action.payload;
      state.items = state.items.filter((item) => item.menu_item !== menu_item);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, updateQuantity, clearCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;