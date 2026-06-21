import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    mobileMenuOpen: false,
    modalOpen: null, // 'login' | 'signup' | 'cart' | null
    searchOpen: false,
    notificationsOpen: false,
    theme: 'light',
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    setMobileMenuOpen: (state, action) => { state.mobileMenuOpen = action.payload; },
    openModal: (state, action) => { state.modalOpen = action.payload; },
    closeModal: (state) => { state.modalOpen = null; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleNotifications: (state) => { state.notificationsOpen = !state.notificationsOpen; },
    setTheme: (state, action) => { state.theme = action.payload; },
  },
});

export const {
  toggleSidebar, setSidebarOpen, toggleMobileMenu, setMobileMenuOpen,
  openModal, closeModal, toggleSearch, toggleNotifications, setTheme,
} = uiSlice.actions;
export default uiSlice.reducer;
