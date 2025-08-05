import { createSlice } from "@reduxjs/toolkit";
import { handleOnPending, handleOnRejected, uiState } from "../../utils/extraReducers";
import { getAllUsers, getCurrentUser, loginUser, logOut, registerUser, updateProfile } from "./userThunks";

const userSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        loggedInUser: null,
        ...uiState,
        remoteUser: null,
        onlineUsers: [],
    },
    reducers: {
        setRemoteUser: (state, action) => {
            state.remoteUser = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setClearMsg: (state, action) => {
            state.error = null;
            state.successMsg = null
        },
        addOnlineUser: (state, action) => {
            const userId = action.payload;
            if(userId) {
                state.onlineUsers.push(userId);
            }
        },
        removeOfflineUser: (state, action) => {
            const userId = action.payload;
            state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
        }
    },
    extraReducers: builder => {
        builder
        .addCase(registerUser.pending, handleOnPending)
        .addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false,
            state.successMsg = action.payload.message,
            state.loggedInUser = action.payload.newUser
        })
        .addCase(registerUser.rejected, handleOnRejected)

        .addCase(loginUser.pending, handleOnPending)
        .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false,
            state.successMsg = action.payload.message,
            state.loggedInUser = action.payload.loginUser
        })
        .addCase(loginUser.rejected, handleOnRejected)

        .addCase(logOut.pending, handleOnPending)
        .addCase(logOut.fulfilled, (state, action) => {
            state.loading = false;
            state.loggedInUser = null;
        })
        .addCase(logOut.rejected, handleOnRejected)

        .addCase(getAllUsers.pending, handleOnPending)
        .addCase(getAllUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.users = action.payload.users
        })
        .addCase(getAllUsers.rejected, handleOnRejected)

        .addCase(updateProfile.pending, handleOnPending)
        .addCase(updateProfile.fulfilled, (state, action) => {
            state.loading = false,
            state.loggedInUser = action.payload.updatedUser
        })
        .addCase(updateProfile.rejected, handleOnRejected)

        .addCase(getCurrentUser.pending, handleOnPending)
        .addCase(getCurrentUser.fulfilled, (state, action) => {
            state.loading = false,
            state.loggedInUser = action.payload.user
        })
        .addCase(getCurrentUser.rejected, handleOnRejected)
    }
});

export const { setRemoteUser, setError, setClearMsg, addOnlineUser, removeOfflineUser } = userSlice.actions;

export const userReducer =  userSlice.reducer;