import { createAsyncThunk } from "@reduxjs/toolkit";
import * as URL from "../../../../helper/url_helper";
import { post } from "../../../../helper/api_helper";

// Action to deposit funds
export const depositFunds = createAsyncThunk(
  "deposit/depositFunds",
  async ({ recovery, userWallet, callBack }: { recovery: string; userWallet: string; callBack?: (err: any, res?: any) => void }, Thunk) => {
    try {
      // Prepare the payload
      const data = { recovery, userWallet };

      // Make the API call using the POST method
      const response = await post(URL.DEPOSIT_FUNDS, data);
      
      // Handle the callback after success
      callBack && callBack(null, response);
      
      return response.data; // Return the response data if successful
    } catch (error) {
      // Log error and call callback with error
      console.error(error, "<=== error in depositFunds");
      callBack && callBack(error);
      return Thunk.rejectWithValue(error); // Reject with the error
    }
  }
);

// Action to mint a token
export const mintToken = createAsyncThunk(
  "mint/mintToken",
  async (
    { id, callBack }: { 
      id: string;
      callBack?: (err: any, res?: any) => void;
    },
    Thunk
  ) => {
    try {
      // Prepare the payload for minting
      const mintData = { id };

      // Make the API call for minting
      const response = await post(URL.MINT_TOKEN, mintData);

      // Handle the callback after success
      callBack && callBack(null, response);

      return response.data; // Return the response data if successful
    } catch (error) {
      // Log error and call callback with error
      console.error(error, "<=== error in mintToken");
      callBack && callBack(error);
      return Thunk.rejectWithValue(error); // Reject with the error
    }
  }
);