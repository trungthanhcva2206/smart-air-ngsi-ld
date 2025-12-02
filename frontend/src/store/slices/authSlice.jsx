/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @Project AirTrack
 * @Authors 
 * - TT (trungthanhcva2206@gmail.com)
 * - Tankchoi (tadzltv22082004@gmail.com)
 * - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2025 CHK. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
*/
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';

// Initial state
const initialState = {
    token: null,
    user: null, // { userId, fullName, email, role }
    resident: null, // { id, notificationEnabled, districts, createdAt, updatedAt }
    isAuthenticated: false,
    loading: false,
    error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            if (response.EC === 0) {
                return response.DT; // { token, user, resident }
            } else {
                return rejectWithValue(response.EM);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.EM || 'Đăng nhập thất bại');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authService.register(userData);
            if (response.EC === 0) {
                return response.DT; // { token, user, resident }
            } else {
                return rejectWithValue(response.EM);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.EM || 'Đăng ký thất bại');
        }
    }
);

export const updateProfileAction = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await authService.updateProfile(profileData);
            if (response.EC === 0) {
                return response.DT; // Updated resident data
            } else {
                return rejectWithValue(response.EM);
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.EM || 'Cập nhật thông tin thất bại');
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.resident = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.resident = action.payload.resident;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.resident = action.payload.resident;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Update Profile
            .addCase(updateProfileAction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfileAction.fulfilled, (state, action) => {
                state.loading = false;
                state.resident = action.payload;
                // Update user info if fullName or email changed
                if (state.user) {
                    state.user.fullName = action.payload.fullName || state.user.fullName;
                    state.user.email = action.payload.email || state.user.email;
                    state.user.updatedAt = action.payload.updatedAt || new Date().toISOString();
                }
                state.error = null;
            })
            .addCase(updateProfileAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
