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
package org.opensource.smartair.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensource.smartair.dtos.AirQualityDataDTO;
import org.opensource.smartair.dtos.PartnerAirQualityDTO;
import org.opensource.smartair.dtos.WeatherDataDTO;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Service for Partner API - provides limited air quality data
 * Only for specific districts with field restrictions
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PartnerApiService {

    private final OrionLdClient orionLdClient;

    private static final List<String> ALLOWED_DISTRICTS = Arrays.asList("PhuongHaDong", "PhuongHoangMai");

    /**
     * Get air quality data for specific allowed district
     * Combines AirQualityObserved and WeatherObserved data
     */
    public Mono<PartnerAirQualityDTO> getPartnerAirQualityByDistrict(String district) {
        if (!ALLOWED_DISTRICTS.contains(district)) {
            log.warn("Access denied for district: {}", district);
            return Mono.empty();
        }

        log.debug("Fetching partner data for district: {}", district);

        // For PhuongHoangMai, need both air quality and weather data
        if ("PhuongHoangMai".equals(district)) {
            return Mono.zip(
                    orionLdClient.getLatestAirQuality(district),
                    orionLdClient.getLatestWeather(district)).map(tuple -> {
                        AirQualityDataDTO airQuality = tuple.getT1();
                        WeatherDataDTO weather = tuple.getT2();
                        return mapToPartnerDTOWithWeather(airQuality, weather);
                    });
        }

        // For PhuongHaDong, only need air quality (pm2.5)
        return orionLdClient.getLatestAirQuality(district)
                .map(this::mapToPartnerDTO);
    }

    /**
     * Map AirQualityDataDTO to PartnerAirQualityDTO (only pm2.5)
     * For PhuongHaDong
     */
    private PartnerAirQualityDTO mapToPartnerDTO(AirQualityDataDTO source) {
        String observedAt = source.getObservedAt();

        PartnerAirQualityDTO dto = new PartnerAirQualityDTO();

        // NGSI-LD Context
        dto.setContext(Arrays.asList(
                "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld",
                "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld"));

        dto.setId(source.getEntityId());
        dto.setType("airQualityObserved");

        // Standard NGSI-LD metadata
        dto.setName(PartnerAirQualityDTO.createProperty(
                "AirQuality-" + source.getDistrict(), observedAt, null));
        dto.setDescription(PartnerAirQualityDTO.createProperty(
                "Air quality monitoring station in " + source.getDistrict() + ", Hanoi",
                observedAt, null));

        // Address
        Map<String, Object> addressValue = new java.util.HashMap<>();
        addressValue.put("addressLocality", source.getDistrict());
        addressValue.put("addressRegion", "Hanoi");
        addressValue.put("addressCountry", "VN");
        addressValue.put("type", "PostalAddress");
        dto.setAddress(PartnerAirQualityDTO.createProperty(addressValue, observedAt, null));

        // Location (GeoProperty)
        if (source.getLocation() != null) {
            dto.setLocation(PartnerAirQualityDTO.createGeoProperty(source.getLocation(), observedAt));
            dto.setLatitude(PartnerAirQualityDTO.createProperty(
                    source.getLocation().getLat(), observedAt, null));
            dto.setLongitude(PartnerAirQualityDTO.createProperty(
                    source.getLocation().getLon(), observedAt, null));
        }

        // Date observed, source, provider
        dto.setDateObserved(PartnerAirQualityDTO.createProperty(observedAt, observedAt, null));
        dto.setSource(PartnerAirQualityDTO.createProperty(
                "AirTrack IoT Sensors", observedAt, null));
        dto.setDataProvider(PartnerAirQualityDTO.createProperty(
                "AirTrack - Hanoi Air Quality Monitoring System", observedAt, null));

        // Station info
        if (source.getStationName() != null) {
            dto.setStationName(PartnerAirQualityDTO.createProperty(
                    source.getStationName(), observedAt, null));
        }
        if (source.getStationCode() != null) {
            dto.setStationCode(PartnerAirQualityDTO.createProperty(
                    source.getStationCode(), observedAt, null));
        }

        // PM2.5 (only measured field for PhuongHaDong)
        if (source.getPm2_5() != null) {
            dto.setPm2_5(PartnerAirQualityDTO.createProperty(
                    source.getPm2_5(), observedAt, "GQ"));
        }

        // Relationships
        if (source.getRefDevice() != null) {
            dto.setRefDevice(PartnerAirQualityDTO.createProperty(
                    source.getRefDevice(), observedAt, null));
        }
        if (source.getRefPointOfInterest() != null) {
            dto.setRefPointOfInterest(PartnerAirQualityDTO.createProperty(
                    source.getRefPointOfInterest(), observedAt, null));
        }

        return dto;
    }

    /**
     * Map AirQualityDataDTO + WeatherDataDTO to PartnerAirQualityDTO
     * For PhuongHoangMai (pm2.5 + temperature + humidity)
     */
    private PartnerAirQualityDTO mapToPartnerDTOWithWeather(AirQualityDataDTO airQuality, WeatherDataDTO weather) {
        // Start with base air quality data
        PartnerAirQualityDTO dto = mapToPartnerDTO(airQuality);

        String observedAt = weather.getObservedAt();

        // Add temperature (from Weather)
        if (weather.getTemperature() != null) {
            dto.setTemperature(PartnerAirQualityDTO.createProperty(
                    weather.getTemperature(), observedAt, "CEL"));
        }

        // Add relativeHumidity (from Weather)
        if (weather.getRelativeHumidity() != null) {
            dto.setRelativeHumidity(PartnerAirQualityDTO.createProperty(
                    weather.getRelativeHumidity(), observedAt, "C62"));
        }

        return dto;
    }
}
