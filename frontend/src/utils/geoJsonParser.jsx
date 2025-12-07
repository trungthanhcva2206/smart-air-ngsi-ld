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
 * @Project Air Track NGSI-LD
 * @Authors 
 *    - TT (trungthanhcva2206@gmail.com)
 *    - Tankchoi (tadzltv22082004@gmail.com)
 *    - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */

// ✅ Import URL của GeoJSON file (giống như Map.jsx)
import hanoiGeoJSONUrl from '../assets/ha_noi_with_latlon2.geojson?url';

let cachedData = null;

/**
 * Load GeoJSON data from URL
 */
const loadGeoJson = async () => {
    if (!cachedData) {
        const response = await fetch(hanoiGeoJSONUrl);
        if (!response.ok) {
            throw new Error('Failed to load GeoJSON data');
        }
        cachedData = await response.json();
    }
    return cachedData;
};

/**
 * Convert Vietnamese text to slug (remove diacritics)
 */
const removeDiacritics = (text) => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

/**
 * Convert to backend format with prefix - CAPITALIZE each word
 * Example: "Văn Miếu - Quốc Tử Giám" + "Phường" -> "PhuongVanMieuQuocTuGiam"
 * Example: "Ba Đình" + "Phường" -> "PhuongBaDinh"
 * Example: "An Khánh" + "Xã" -> "XaAnKhanh"
 */
const convertToBackendFormat = (name, classification) => {
    // Loại bỏ từ "Phường" hoặc "Xã" nếu có trong tên
    const cleanName = name.replace(/^(Phường|Xã)\s+/i, '');
    
    // Bỏ dấu
    const withoutDiacritics = removeDiacritics(cleanName);
    
    // Tách thành các từ, loại bỏ dấu gạch ngang và khoảng trắng thừa
    const words = withoutDiacritics
        .split(/[-\s]+/)
        .filter(word => word.length > 0);
    
    // Viết hoa chữ cái đầu của mỗi từ, giữ nguyên chữ thường phần còn lại
    const camelCased = words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    
    // Thêm prefix tùy theo phân loại
    const prefix = classification === "Phường" ? "Phuong" : "Xa";
    
    return prefix + camelCased;
};

/**
 * Convert Vietnamese text to slug (for fallback)
 */
const convertToSlug = (text) => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\s+/g, '')
        .toLowerCase();
};

/**
 * Extract district names from GeoJSON
 */
export const getDistrictsFromGeoJson = async () => {
    const data = await loadGeoJson();
    const districts = new Map();

    data.features.forEach(feature => {
        const name = feature.properties["Tên đơn vị"];
        const classification = feature.properties["Phân loại"];
        
        if (classification === "Phường" || classification === "Xã") {
            const coords = feature.properties;
            
            districts.set(name, {
                value: convertToBackendFormat(name, classification),
                label: name,
                lat: coords.lat,
                lon: coords.lon,
                population: coords["Dân số"],
                area: coords["Diện tích"]
            });
        }
    });

    return Array.from(districts.values());
};

/**
 * Map district name to backend format
 */
export const mapDistrictToBackend = async (districtLabel) => {
    const data = await loadGeoJson();
    const feature = data.features.find(
        f => f.properties["Tên đơn vị"] === districtLabel
    );
    
    if (feature) {
        const classification = feature.properties["Phân loại"];
        return convertToBackendFormat(districtLabel, classification);
    }
    
    return convertToSlug(districtLabel);
};

/**
 * Get all unique wards/communes
 */
export const getAllWards = async () => {
    const data = await loadGeoJson();
    
    if (!data || !data.features) {
        console.error('❌ GeoJSON data is invalid');
        return [];
    }

    const wards = data.features
        .filter(f => f.properties["Phân loại"] === "Phường" || f.properties["Phân loại"] === "Xã")
        .map(f => {
            const name = f.properties["Tên đơn vị"];
            const classification = f.properties["Phân loại"];
            const backendName = convertToBackendFormat(name, classification);
            
            // ✅ DEBUG: Log ra để so sánh
            console.log(`📍 ${name} → ${backendName}`);
            
            return {
                name: name,
                value: backendName,
                lat: f.properties.lat,
                lon: f.properties.lon,
                population: f.properties["Dân số"],
                area: f.properties["Diện tích"]
            };
        });

    console.log(`✅ Loaded ${wards.length} wards from GeoJSON`);
    return wards;
};