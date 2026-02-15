package com.youcode.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "file.storage")
@Getter
@Setter
public class FileStorageProperties {
    private String uploadDir = "uploads";
    private long maxFileSize = 10485760; // 10MB
    private String[] allowedExtensions = { "jpg", "jpeg", "png", "pdf", "doc", "docx" };
}
