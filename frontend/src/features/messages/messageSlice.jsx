import { createSlice } from "@reduxjs/toolkit";
import { handleOnPending, handleOnRejected, uiState } from "../../utils/extraReducers.jsx";
import { deleteMessage, getUnreadMessages, getUserMessages, sendMessage } from "./messageThunks.jsx";


const messageSlice = createSlice({
    name: "messages",
    initialState: {
        messages: [],
        incomingMessage: null,
        unreadMessages: null,
        ...uiState,
    },
    reducers: {
        setIncomingMessage: (state, action) => {
            state.incomingMessage = action.payload;
        },
        addChatMessages: (state, action) => {
            if(action.payload) {
                state.messages.push(action.payload);
            }
        },
        deleteChatMessage: (state, action) => {
            const msgId = action.payload;
            state.messages = state.messages.filter(msg => msg._id !== msgId);
        },
        setUnreadMessage: (state, action) => {
        const { senderId, receiverId } = action.payload;
        state.unreadMessages = state.unreadMessages.filter(
            msg => !(msg.senderId === senderId && msg.receiverId === receiverId)
        );
        }
    },
    extraReducers: builder => {
        builder
        .addCase(getUserMessages.pending, handleOnPending)
        .addCase(getUserMessages.fulfilled, (state, action) => {
            state.loading = false;
            const { message, messages} = action.payload;
            state.successMsg = message;
            state.messages = messages;
        })
        .addCase(getUserMessages.rejected, handleOnRejected)

        .addCase(sendMessage.pending, handleOnPending)
        .addCase(sendMessage.fulfilled, (state, action) => {
            state.loading = false;
            state.messages.push(action.payload.newMessage);
        })
        .addCase(sendMessage.rejected, handleOnRejected)

        .addCase(getUnreadMessages.pending, handleOnPending)
        .addCase(getUnreadMessages.fulfilled, (state, action) => {
            state.loading = false;
            state.unreadMessages = action.payload.unreadMessages;
        })
        .addCase(getUnreadMessages.rejected, handleOnRejected)

        .addCase(deleteMessage.pending, handleOnPending)
        .addCase(deleteMessage.fulfilled, (state, action) => {
            const { deletedMsgId } = action.payload;
            state.messages = state.messages.filter(msg => msg && msg._id !==  deletedMsgId);
        })
        .addCase(deleteMessage.rejected, handleOnRejected);
    }
});

export const { addChatMessages, deleteChatMessage, setIncomingMessage, setUnreadMessage } = messageSlice.actions;

export const messageReducer = messageSlice.reducer;