package com.youcode;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class YoucodeBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(YoucodeBackendApplication.class, args);
    }

}
