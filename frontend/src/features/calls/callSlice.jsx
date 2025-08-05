import { createSlice } from "@reduxjs/toolkit";

const callSlice = createSlice({
    name: "calls",
    initialState: {
        incomingCall: null,
        acceptCall: false,
    },
    reducers: {
        setIncomingCall: (state, action) => {
            state.incomingCall = action.payload
        },
        setAcceptCall: (state, action) => {
            state.acceptCall = action.payload;
        }
    },
});

export const {setIncomingCall, setAcceptCall} = callSlice.actions;

export const callReducer = callSlice.reducer;