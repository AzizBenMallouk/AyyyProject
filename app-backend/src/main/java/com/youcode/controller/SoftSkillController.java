package com.youcode.controller;

import com.youcode.dto.SoftSkillDTO;
import com.youcode.service.SoftSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/soft-skills")
@RequiredArgsConstructor
public class SoftSkillController {

    private final SoftSkillService softSkillService;

    @GetMapping
    public ResponseEntity<List<SoftSkillDTO>> getAllSoftSkills() {
        return ResponseEntity.ok(softSkillService.getAllSoftSkills());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER')")
    public ResponseEntity<SoftSkillDTO> createSoftSkill(@RequestBody SoftSkillDTO dto) {
        return ResponseEntity.ok(softSkillService.createSoftSkill(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER')")
    public ResponseEntity<SoftSkillDTO> updateSoftSkill(@PathVariable Long id, @RequestBody SoftSkillDTO dto) {
        return ResponseEntity.ok(softSkillService.updateSoftSkill(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER')")
    public ResponseEntity<Void> deleteSoftSkill(@PathVariable Long id) {
        softSkillService.deleteSoftSkill(id);
        return ResponseEntity.noContent().build();
    }
}
