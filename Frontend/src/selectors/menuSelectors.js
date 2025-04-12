import { createSelector } from 'reselect';

const selectMenu = (state) => state.menu || {};

export const selectMenuItemDetails = createSelector(
  [selectMenu],
  (menu) => {
    const item = menu.menuItem;
    return {
      menuItem: item && item.menuItem ? item.menuItem : item,
      loading: menu.loading,
      error: menu.error,
    };
  }
);

export const selectCartItems = (state) => state.cart.items || [];