package com.gocelerate.gocelerate;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(
    info = @Info(
        title = "Gocelerate API",
        version = "1.0",
        description = "Grant and Project Management Platform for NGOs and Funders"
    )
)
public class GocelerateApplication {

    public static void main(String[] args) {
        SpringApplication.run(GocelerateApplication.class, args);
    }
}
