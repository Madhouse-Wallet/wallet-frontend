import { createSlice } from "@reduxjs/toolkit";
import { depositFunds } from "./action";
import { mintToken } from "./action";

interface DepositState {
  loading: boolean;
  error: string | null;
  mintLoading: boolean;
  mintError: string | null;
}

const initialState: DepositState = {
  loading: false,
  error: null,
  mintLoading: false,
  mintError: null,
};

const depositSlice = createSlice({
  name: "deposit",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(depositFunds.pending, (state) => {
        state.loading = true;
      })
      .addCase(depositFunds.fulfilled, (state) => {
        state.loading = false;
        state.error = null; // Reset error on success
      })
      .addCase(depositFunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Store the error message
      })

      // Handle mintToken states
      .addCase(mintToken.pending, (state) => {
        state.mintLoading = true;
      })
      .addCase(mintToken.fulfilled, (state) => {
        state.mintLoading = false;
        state.mintError = null; // Reset error on success
      })
      .addCase(mintToken.rejected, (state, action) => {
        state.mintLoading = false;
        state.mintError = action.payload as string; // Store the error message
      });
  },
});

export default depositSlice.reducer;
