import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Base_url } from "../../utils/extraReducers";

export const getUserMessages = createAsyncThunk("/messages", 
    async (userId, {rejectWithValue}) => {
        try {
            const res = await axios.get(`${Base_url}/messages/${userId}/message`, {withCredentials: true})  
            return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to fetch messages");
        }
    }
);

export const sendMessage = createAsyncThunk("/send-message", 
    async ({messageData, setProgress}, {rejectWithValue}) => {
        try {
            const res = await axios.post(`${Base_url}/messages/send-message`, messageData, {
                withCredentials: true,  
                onUploadProgress: (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                if (setProgress) setProgress(percent);
            }})
            return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to send message");
        }
    }
);

export const getUnreadMessages = createAsyncThunk("unread-messages", 
    async(userId, {rejectWithValue}) => {
        try {
            const res = await axios.get(`${Base_url}/messages/${userId}/unread`, {withCredentials: true});
            return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to fetch unread message");
        }
    }
);

export const markAsReadMessages = createAsyncThunk("/read", 
    async({senderId, receiverId}, {rejectWithValue}) => {
        try {
            const res = await axios.post(`${Base_url}/messages/read`, {senderId, receiverId}, {withCredentials: true})
            return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to read messages");
        }
});

export const deleteMessage = createAsyncThunk("/message/delete", 
    async (msgId, {rejectWithValue}) => {
        try {
            const res = await axios.get(`${Base_url}/messages/${msgId}/delete`, {withCredentials: true})
            return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to send message");
        }
    }
);