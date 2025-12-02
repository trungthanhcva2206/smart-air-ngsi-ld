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
package org.opensource.smartair.configs;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3.0 Configuration for Smart Air API Documentation
 * Access Swagger UI at: http://localhost:8081/swagger-ui.html
 * Access OpenAPI JSON at: http://localhost:8081/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

        @Value("${spring.application.name:Smart Air NGSI-LD Backend}")
        private String applicationName;

        @Bean
        public OpenAPI smartAirOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("Smart Air - Open Environmental Data API")
                                                .description(
                                                                """
                                                                                ## 🌍 Open API for Environmental Monitoring - Hanoi City

                                                                                This API provides **real-time and historical environmental data** for **126 districts in Hanoi**, including:
                                                                                - 🌡️ **Weather observations** (temperature, humidity, wind speed, precipitation, atmospheric pressure, visibility)
                                                                                - 💨 **Air quality metrics** (PM2.5, PM10, CO, NO, NO2, NOx, O3, SO2, NH3, AQI)
                                                                                - 📍 **Monitoring station locations** (126 platforms across all Hanoi districts)
                                                                                - 📈 **Historical time-series data** with aggregation support (hourly, daily, weekly, monthly)

                                                                                ### 📊 Data Sources & Updates
                                                                                - **Real-time data**: Updated every 5 minutes
                                                                                - **Weather data**: OpenWeatherMap Current Weather API
                                                                                - **Air quality data**: OpenWeatherMap Air Pollution API
                                                                                - **Storage**: NGSI-LD Context Broker (Orion-LD) + QuantumLeap time-series database

                                                                                ### 🔓 Open Data License
                                                                                This API provides open access to environmental data under the following terms:

                                                                                **Data Attribution:**
                                                                                - Weather and Air Quality data © [OpenWeatherMap](https://openweathermap.org/)
                                                                                - Licensed under [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)
                                                                                - **Required Attribution**: "Weather data provided by OpenWeatherMap (https://openweathermap.org/)"

                                                                                **API Code License:**
                                                                                - API implementation © 2024 Smart Air Development Team
                                                                                - Licensed under [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

                                                                                **Usage Terms:**
                                                                                - ✅ Free for personal, educational, and commercial use
                                                                                - ✅ No API key required for public endpoints
                                                                                - ✅ No rate limiting (fair use policy applies)
                                                                                - ⚠️ Attribution to OpenWeatherMap is required when using the data
                                                                                - ⚠️ Data provided "as-is" without warranty

                                                                                ### 🌐 NGSI-LD Compliance
                                                                                This API follows [ETSI NGSI-LD specification](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.04.01_60/gs_cim009v010401p.pdf)
                                                                                and [FIWARE Smart Data Models](https://smartdatamodels.org/) standards:
                                                                                - **WeatherObserved**: [Weather data model](https://github.com/smart-data-models/dataModel.Environment/tree/master/WeatherObserved)
                                                                                - **AirQualityObserved**: [Air quality data model](https://github.com/smart-data-models/dataModel.Environment/tree/master/AirQualityObserved)
                                                                                - **Platform & Device**: [Sensor models](https://github.com/smart-data-models/dataModel.Device)

                                                                                ### 📋 Available Endpoints
                                                                                - **Latest Data**: Current observations for all districts or specific district
                                                                                - **Historical Data**: Time-series queries with date range (ISO 8601) and aggregation
                                                                                - **Platforms**: Get information about monitoring stations
                                                                                - **Districts**: Get list of available districts

                                                                                ### 🔗 Related Resources
                                                                                - OpenWeatherMap API: https://openweathermap.org/api
                                                                                - FIWARE Orion-LD: https://github.com/FIWARE/context.Orion-LD
                                                                                - QuantumLeap: https://github.com/orchestracities/ngsi-timeseries-api
                                                                                """)
                                                .version("1.0.0")
                                                .contact(new Contact()
                                                                .name("Smart Air Development Team")
                                                                .email("trungthanhcva2206@gmail.com")
                                                                .url("https://github.com/trungthanhcva2206/smart-air-ngsi-ld"))
                                                .license(new License()
                                                                .name("Apache 2.0")
                                                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                                .servers(List.of(
                                                new Server()
                                                                .url("http://localhost:8081")
                                                                .description("Development Server"),
                                                new Server()
                                                                .url("https://api.smartair.hanoi.vn")
                                                                .description("Production Server (if deployed)")));
        }
}
