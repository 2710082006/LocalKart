import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.get();
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1 }, { rejectWithValue, dispatch }) => {
  try {
    await cartAPI.add({ productId, quantity });
    dispatch(fetchCart());
    return true;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue, dispatch }) => {
  try {
    await cartAPI.update(productId, { quantity });
    dispatch(fetchCart());
    return true;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue, dispatch }) => {
  try {
    await cartAPI.remove(productId);
    dispatch(fetchCart());
    return true;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await cartAPI.clear();
    return true;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    count: 0,
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.count = 0;
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.count = action.payload.count;
        state.subtotal = action.payload.subtotal;
        state.deliveryFee = action.payload.deliveryFee;
        state.total = action.payload.total;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.count = 0;
        state.subtotal = 0;
        state.deliveryFee = 0;
        state.total = 0;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
