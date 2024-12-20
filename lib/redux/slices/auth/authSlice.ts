import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserInfo {
  name: string;
  email: string;
  profileImage: string;
  verifier: string;
  verifierId: string;
  aggregateVerifier: string;
  typeOfLogin: string;
}

interface AuthState {
  userInfo: UserInfo | null;
  safeAddress: string | null;
  userBalance: string | null;
}

const initialState: AuthState = {
  userInfo: null,
  safeAddress: null,
  userBalance: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
    setSafeAddress: (state, action: PayloadAction<string>) => {
      state.safeAddress = action.payload;
    },
    setUserBalance: (state, action: PayloadAction<string>) => {
      state.userBalance = action.payload;
    },
    resetAuthState: () => initialState,
  },
});

export const { setUserInfo, setSafeAddress, setUserBalance, resetAuthState } = authSlice.actions;

export default authSlice.reducer;
