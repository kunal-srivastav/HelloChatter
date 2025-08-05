import { configureStore } from "@reduxjs/toolkit";
import {userReducer}  from "../features/users/userSlice.jsx";
import { messageReducer } from "../features/messages/messageSlice.jsx";
import { callReducer } from "../features/calls/callSlice.jsx";

export const store = configureStore ({
    reducer: {
        users: userReducer,
        messages: messageReducer,
        calls: callReducer
    }
})