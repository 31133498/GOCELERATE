package com.gocelerate.gocelerate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Generic wrapper for every API response — every endpoint returns this shape:
// { "success": true, "message": "...", "data": { ... } }
// The <T> type parameter lets us wrap any data type: ApiResponse<String>, ApiResponse<Project>, etc.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
