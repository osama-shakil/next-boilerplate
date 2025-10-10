import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import userSlice from "./user/userSlice";
import  bookingSlice  from "./booking/bookingSlice";

const reducers = combineReducers({
  user: userSlice,
 booking: bookingSlice

});

const store = configureStore({
  reducer: reducers,
  devTools: process.env.NODE_ENV !== "production",
});
export default store;
