/* Core */
import { configureStore } from "@reduxjs/toolkit";

/* Instruments */
import { reducer } from "./rootReducer";
import { middleware } from "./middleware";

export const reduxStore = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(middleware);
  },
});
