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
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
import axios from 'axios';
import nProgress from 'nprogress';
import { store } from '../store/store';
nProgress.configure({ showSpinner: false, trickleSpeed: 100 });
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081'
});
// Add a request interceptor
instance.interceptors.request.use(function (config) {
    const token = store?.getState()?.auth?.token;
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    nProgress.start();
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    nProgress.done();
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    const data = response && response.data ? response.data : response;


    return data;
}, function (error) {
    nProgress.done();
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const errorData = error && error.response ? error.response.data : null;


    return Promise.reject(error);
});
export default instance;