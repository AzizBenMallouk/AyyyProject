package com.youcode.controller;

import com.youcode.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File Management", description = "APIs for file upload and download")
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    @Operation(summary = "Upload file", description = "Upload a file to specified category")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "documents") String category) {
        try {
            String filename = fileStorageService.storeFile(file, category);
            return ResponseEntity.ok(Map.of(
                    "filename", filename,
                    "message", "File uploaded successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/download/{category}/{filename:.+}")
    @Operation(summary = "Download file", description = "Download a file by category and filename")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String category,
            @PathVariable String filename) {
        try {
            String fullPath = category + "/" + filename;
            Resource resource = fileStorageService.loadFileAsResource(fullPath);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/view/{category}/{filename:.+}")
    @Operation(summary = "View file", description = "View/serve a file inline")
    public ResponseEntity<Resource> viewFile(
            @PathVariable String category,
            @PathVariable String filename) {
        try {
            String fullPath = category + "/" + filename;
            Resource resource = fileStorageService.loadFileAsResource(fullPath);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{category}/{filename:.+}")
    @Operation(summary = "Delete file", description = "Delete a file")
    public ResponseEntity<?> deleteFile(
            @PathVariable String category,
            @PathVariable String filename) {
        try {
            String fullPath = category + "/" + filename;
            fileStorageService.deleteFile(fullPath);
            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
