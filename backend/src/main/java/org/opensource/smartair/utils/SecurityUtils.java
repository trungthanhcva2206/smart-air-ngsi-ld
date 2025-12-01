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
 * @Copyright (C) 2024 CHK. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
package org.opensource.smartair.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility class để lấy thông tin user hiện tại từ SecurityContext
 * Sử dụng trong controllers để check ownership
 */
public class SecurityUtils {

    /**
     * Lấy userId của user hiện đang đăng nhập
     * 
     * @return userId hoặc null nếu chưa đăng nhập
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        // Principal là userId (được set trong JwtAuthenticationFilter)
        Object principal = authentication.getPrincipal();

        if (principal instanceof Long) {
            return (Long) principal;
        }

        return null;
    }

    /**
     * Check xem userId hiện tại có match với userId được yêu cầu không
     * 
     * @param requestedUserId userId mà request muốn truy cập
     * @return true nếu match (cho phép access)
     */
    public static boolean isCurrentUser(Long requestedUserId) {
        Long currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(requestedUserId);
    }

    /**
     * Check xem user hiện tại có role ADMIN không
     * 
     * @return true nếu là admin
     */
    public static boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
    }
}
