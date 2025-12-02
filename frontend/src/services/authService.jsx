/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @Project smart-air-ngsi-ld
 * @Authors 
 *    - TT (trungthanhcva2206@gmail.com)
 *    - Tankchoi (tadzltv22082004@gmail.com)
 *    - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2025 CHK. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
*/

import axios from '../utils/axiosCustomize';

/**
 * Login user
 * @param {Object} credentials - {email, password}
 * @returns {Promise<{ec: number, em: string, dt: object}>}
 */
export const login = async (credentials) => {
    try {
        const response = await axios.post('/api/auth/login', credentials);

        // Handle EC/EM/DT format from backend
        if (response.EC === 0 && response.DT) {
            const data = response.DT;
            return {
                EC: 0,
                EM: response.EM,
                DT: {
                    token: data.token,
                    user: {
                        userId: data.id,
                        fullName: data.fullName,
                        email: data.email,
                        role: data.role,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                    },
                    resident: {
                        id: data.id,
                        notificationEnabled: true,
                        districts: data.subscribedDistricts || [],
                        isVerified: data.isVerified
                    }
                }
            };
        }

        return response;
    } catch (error) {
        console.error('Error logging in:', error);
        return {
            EC: -1,
            EM: error.response?.data?.EM || error.message || 'Đăng nhập thất bại',
            DT: null
        };
    }
};

/**
 * Register new user
 * @param {Object} userData - {fullName, email, password, notificationEnabled, districts}
 * @returns {Promise<{ec: number, em: string, dt: object}>}
 */
export const register = async (userData) => {
    try {
        const response = await axios.post('/api/auth/register', userData);

        // Handle EC/EM/DT format from backend
        if (response.EC === 0 && response.DT) {
            const data = response.DT;
            return {
                EC: 0,
                EM: response.EM,
                DT: {
                    token: data.token,
                    user: {
                        userId: data.id,
                        fullName: data.fullName,
                        email: data.email,
                        role: data.role,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                    },
                    resident: {
                        id: data.id,
                        notificationEnabled: true,
                        districts: data.subscribedDistricts || [],
                        isVerified: data.isVerified
                    }
                }
            };
        }

        return response;
    } catch (error) {
        console.error('Error registering:', error);
        return {
            EC: -1,
            EM: error.response?.data?.EM || error.message || 'Đăng ký thất bại',
            DT: null
        };
    }
};

/**
 * Update user profile
 * @param {Object} profileData - {fullName, email, notificationEnabled, districts}
 * @returns {Promise<{ec: number, em: string, dt: object}>}
 */
export const updateProfile = async (profileData) => {
    try {
        return await axios.put('/api/residents/me', profileData);
    } catch (error) {
        console.error('Error updating profile:', error);
        return {
            EC: -1,
            EM: error.response?.data?.EM || error.message || 'Cập nhật thông tin thất bại',
            DT: null
        };
    }
};
