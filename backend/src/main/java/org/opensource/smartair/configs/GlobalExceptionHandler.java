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
package org.opensource.smartair.configs;

import jakarta.servlet.http.HttpServletRequest;
import org.opensource.smartair.dtos.ApiResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler
 * - Bắt validation errors (@Valid)
 * - Trả về ApiResponseDTO thống nhất
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle validation errors từ @Valid
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseDTO<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        // Collect tất cả validation errors
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        // Tạo message tổng hợp
        String message = "Validation failed: " + errors.size() + " error(s)";

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDTO.error(message, errors));
    }

    /**
     * Handle các runtime exceptions khác
     * CRITICAL: Skip SSE endpoints to prevent HttpMessageNotWritableException
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponseDTO<Object>> handleRuntimeException(
            RuntimeException ex, HttpServletRequest request) {

        // Check if this is an SSE request
        String acceptHeader = request.getHeader("Accept");
        if (acceptHeader != null && acceptHeader.contains(MediaType.TEXT_EVENT_STREAM_VALUE)) {
            // Re-throw to let Spring handle SSE errors naturally
            throw ex;
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDTO.error(ex.getMessage(), null));
    }

    /**
     * Handle generic exceptions
     * CRITICAL: Skip SSE endpoints to prevent HttpMessageNotWritableException
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDTO<Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {

        // Check if this is an SSE request (Accept: text/event-stream)
        String acceptHeader = request.getHeader("Accept");
        if (acceptHeader != null && acceptHeader.contains(MediaType.TEXT_EVENT_STREAM_VALUE)) {
            // Don't handle SSE exceptions - let Spring handle them naturally
            throw new RuntimeException(ex);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDTO.error("An unexpected error occurred: " + ex.getMessage(), null));
    }
}
