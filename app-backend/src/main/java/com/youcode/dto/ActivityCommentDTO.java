package com.youcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityCommentDTO {
    private Long id;
    private Long assignmentId;
    private Long userId;
    private String userName;
    private String userImage;
    private String content;
    private LocalDateTime createdAt;
}
