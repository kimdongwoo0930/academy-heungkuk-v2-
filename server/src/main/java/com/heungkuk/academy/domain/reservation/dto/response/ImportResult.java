package com.heungkuk.academy.domain.reservation.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ImportResult {

    private int created;
    private int updated;
    private int failed;
    private List<String> errors;

    public static ImportResult of(int created, int updated, int failed, List<String> errors) {
        return ImportResult.builder().created(created).updated(updated).failed(failed)
                .errors(errors).build();
    }
}
