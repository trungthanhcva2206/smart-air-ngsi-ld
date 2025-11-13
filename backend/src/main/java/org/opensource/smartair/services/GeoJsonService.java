package org.opensource.smartair.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Service to load and parse GeoJSON data
 */
@Slf4j
@Service
public class GeoJsonService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<String> allDistricts = new ArrayList<>();

    /**
     * Load all district names from GeoJSON on startup
     */
    @PostConstruct
    public void loadDistricts() {
        try {
            ClassPathResource resource = new ClassPathResource("static/ha_noi_with_latlon2.geojson");
            JsonNode root = objectMapper.readTree(resource.getInputStream());
            JsonNode features = root.get("features");

            if (features != null && features.isArray()) {
                for (JsonNode feature : features) {
                    JsonNode properties = feature.get("properties");
                    String name = properties.get("Tên đơn vị").asText();
                    String classification = properties.get("Phân loại").asText();

                    // Convert to backend format
                    String backendFormat = convertToBackendFormat(name, classification);
                    allDistricts.add(backendFormat);
                }
            }

            log.info("✅ Loaded {} districts from GeoJSON", allDistricts.size());
        } catch (IOException e) {
            log.error("❌ Failed to load GeoJSON: {}", e.getMessage());
            // Fallback to empty list
            allDistricts = new ArrayList<>();
        }
    }

    /**
     * Get all district names
     */
    public List<String> getAllDistricts() {
        return new ArrayList<>(allDistricts);
    }

    /**
     * Convert to backend format (same logic as frontend geoJsonParser)
     */
    private String convertToBackendFormat(String name, String classification) {
        // Remove "Phường" or "Xã" prefix
        String cleanName = name.replaceFirst("^(Phường|Xã)\\s+", "");
        
        // Remove diacritics
        String withoutDiacritics = removeDiacritics(cleanName);
        
        // Split and capitalize
        String[] words = withoutDiacritics.split("[\\s\\-]+");
        StringBuilder result = new StringBuilder();
        
        for (String word : words) {
            if (!word.isEmpty()) {
                result.append(word.substring(0, 1).toUpperCase())
                      .append(word.substring(1).toLowerCase());
            }
        }
        
        // Add prefix
        String prefix = classification.equals("Phường") ? "Phuong" : "Xa";
        return prefix + result.toString();
    }

    private String removeDiacritics(String text) {
        return text
            .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
            .replaceAll("[èéẹẻẽêềếệểễ]", "e")
            .replaceAll("[ìíịỉĩ]", "i")
            .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
            .replaceAll("[ùúụủũưừứựửữ]", "u")
            .replaceAll("[ỳýỵỷỹ]", "y")
            .replaceAll("đ", "d")
            .replaceAll("[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]", "A")
            .replaceAll("[ÈÉẸẺẼÊỀẾỆỂỄ]", "E")
            .replaceAll("[ÌÍỊỈĨ]", "I")
            .replaceAll("[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]", "O")
            .replaceAll("[ÙÚỤỦŨƯỪỨỰỬỮ]", "U")
            .replaceAll("[ỲÝỴỶỸ]", "Y")
            .replaceAll("Đ", "D");
    }
}