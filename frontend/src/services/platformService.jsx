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
 * Get all platforms (one-time fetch, not SSE)
 * Used for getting district list in Profile page
 * @returns {Promise<{ec: number, em: string, dt: Array}>}
 */
export const getPlatforms = async () => {
    try {
        return await axios.get('/api/platforms');
    } catch (error) {
        console.error('Error fetching platforms:', error);
        return {
            EC: -1,
            EM: error.message || 'Không thể tải danh sách platforms',
            DT: []
        };
    }
};
