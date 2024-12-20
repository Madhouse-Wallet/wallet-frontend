import { Middleware } from '@reduxjs/toolkit';

export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.log('Action:', action);
  const result = next(action);
  console.log('New State:', store.getState());
  return result;
};
