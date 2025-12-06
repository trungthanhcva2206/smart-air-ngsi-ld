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

const OpenData = () => {
    const apiUrl = import.meta.env.VITE_API_URL;

    return (
        <div className="open-data-page" style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
            <iframe
                src={`${apiUrl}/swagger-ui/index.html`}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none"
                }}
                title="API Documentation"
            />
        </div>
    );
};

export default OpenData;
