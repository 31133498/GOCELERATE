package com.gocelerate.gocelerate.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Thrown when a requested entity does not exist in the database.
// @ResponseStatus is supplementary — the actual HTTP status is set in GlobalExceptionHandler.
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
