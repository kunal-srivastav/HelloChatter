import { createAsyncThunk } from "@reduxjs/toolkit";
import { Base_url } from "../../utils/extraReducers";
import axios from "axios";


console.log("Base_ ufur", Base_url)

export const registerUser = createAsyncThunk("/users/register", 
    async(userData , {rejectWithValue}) => {
        try {
            const res = await axios.post(`${Base_url}/users/register`, userData, {withCredentials: true});
            return res.data;
        } catch (err) {
            console.log("User thunk err", err);
            return rejectWithValue(err?.response?.data?.message || "Registration failed")
        }
});

export const loginUser = createAsyncThunk("/users/login",
    async({email, password}, {rejectWithValue}) => {
        try {
            const res = await axios.post(`${Base_url}/users/login`, { email, password }, { withCredentials: true } );
            return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Login failed")
        }
    }
);

export const logOut = createAsyncThunk("/users/logout",
    async (_, {rejectWithValue}) => {
        try {
            const res = await axios.get(`${Base_url}/users/logout`, {withCredentials: true});
            return res.data.message;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Logout failed");
        }
});

export const getAllUsers = createAsyncThunk("/users/getAllUsers",
    async (_, {rejectWithValue}) => {
        try {
            const res = await axios.get(`${Base_url}/users/getAllUsers`, {withCredentials: true} );
            return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to get all users");
        }
});

export const updateProfile = createAsyncThunk("/users/update-profile",
    async ({userId, userData}, {rejectWithValue}) => {
        try {
        const res = await axios.put(`${Base_url}/users/${userId}/update-profile`, userData, {withCredentials: true});
        return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to update profile");
        }
});

export const getCurrentUser = createAsyncThunk("/users/current-user",
    async (_, {rejectWithValue}) => {
        try {
            const res = await axios.get(`${Base_url}/users/current-user`, {withCredentials: true});
            return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to fetched current user");
        }
});