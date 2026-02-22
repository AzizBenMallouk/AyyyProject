package com.youcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampusDTO {
    private Long id;
    private String name;
    private String address;
    private Long cityId;
    private String cityName;
}
