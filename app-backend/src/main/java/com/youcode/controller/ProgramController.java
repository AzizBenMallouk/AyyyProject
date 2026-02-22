package com.youcode.controller;

import com.youcode.dto.ProgramDTO;
import com.youcode.service.ProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    @PostMapping
    public ResponseEntity<ProgramDTO> createProgram(@RequestBody ProgramDTO dto) {
        return ResponseEntity.ok(programService.createProgram(dto));
    }

    @GetMapping
    public ResponseEntity<List<ProgramDTO>> getAllPrograms() {
        return ResponseEntity.ok(programService.getAllPrograms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramDTO> getProgramById(@PathVariable Long id) {
        return ResponseEntity.ok(programService.getProgramById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramDTO> updateProgram(@PathVariable Long id, @RequestBody ProgramDTO dto) {
        return ResponseEntity.ok(programService.updateProgram(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        programService.deleteProgram(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/version")
    public ResponseEntity<ProgramDTO> createNewVersion(@PathVariable Long id) {
        return ResponseEntity.ok(programService.createNewVersion(id));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Void> archiveProgram(@PathVariable Long id) {
        programService.archiveProgram(id);
        return ResponseEntity.ok().build();
    }
}
