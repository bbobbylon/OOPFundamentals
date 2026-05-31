package com.bob.devhub.dto;

import com.bob.devhub.model.ProgressStatus;
import jakarta.validation.constraints.NotNull;

public record ProgressUpdateRequest(
    @NotNull ProgressStatus status
) {}
