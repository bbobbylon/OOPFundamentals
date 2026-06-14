package com.bob.devhub.service.exec;

import com.bob.devhub.dto.ExecResult;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * Tests the runner's safety rails. The "real execution" cases require Python on
 * PATH; they are skipped (not failed) where it isn't available.
 */
class ExecutionServiceTest {

    private ExecutionService svc;

    @BeforeEach
    void setup() {
        svc = new ExecutionService();
        ReflectionTestUtils.setField(svc, "enabled", true);
        ReflectionTestUtils.setField(svc, "timeoutMs", 4000L);
        ReflectionTestUtils.setField(svc, "maxOutputBytes", 2000);
        ReflectionTestUtils.setField(svc, "maxCodeBytes", 5000);
        ReflectionTestUtils.setField(svc, "maxConcurrent", 2);
        ReflectionTestUtils.setField(svc, "pythonCmd", "");
        ReflectionTestUtils.setField(svc, "nodeCmd", "");
        ReflectionTestUtils.setField(svc, "shellCmd", "");
        ReflectionTestUtils.setField(svc, "tsArgs", "--no-warnings --experimental-transform-types");
    }

    @AfterEach
    void tearDown() { svc.shutdown(); }

    @SuppressWarnings("unchecked")
    private boolean pythonAvailable() {
        var caps = svc.capabilities();
        for (Map<String, Object> l : (List<Map<String, Object>>) caps.get("languages")) {
            if ("python".equals(l.get("id"))) return Boolean.TRUE.equals(l.get("available"));
        }
        return false;
    }

    @Test
    void disabledRunnerRefuses() {
        ReflectionTestUtils.setField(svc, "enabled", false);
        assertThat(svc.isEnabled()).isFalse();
        assertThatThrownBy(() -> svc.run(Language.PYTHON, "print(1)", null))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void oversizedCodeIsRejected() {
        String big = "x".repeat(6000);
        assertThatThrownBy(() -> svc.run(Language.PYTHON, big, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void capabilitiesReportShape() {
        var caps = svc.capabilities();
        assertThat(caps).containsKeys("enabled", "timeoutMs", "languages");
        assertThat((List<?>) caps.get("languages")).hasSize(3);
    }

    @Test
    void pythonProducesStdout() {
        assumeTrue(pythonAvailable(), "python not on PATH — skipping real execution");
        ExecResult r = svc.run(Language.PYTHON, "print('hi', 6*7)", null);
        assertThat(r.stdout()).contains("hi 42");
        assertThat(r.exitCode()).isZero();
        assertThat(r.timedOut()).isFalse();
    }

    @Test
    void environmentIsSanitized() {
        assumeTrue(pythonAvailable(), "python not on PATH — skipping");
        // JWT_SECRET lives in the backend env; user code must NOT see it.
        ExecResult r = svc.run(Language.PYTHON, "import os; print(os.environ.get('JWT_SECRET'))", null);
        assertThat(r.stdout().trim()).isEqualTo("None");
    }

    @Test
    void infiniteLoopIsKilledOnTimeout() {
        assumeTrue(pythonAvailable(), "python not on PATH — skipping");
        ExecResult r = svc.run(Language.PYTHON, "while True:\n    pass", null);
        assertThat(r.timedOut()).isTrue();
        assertThat(r.exitCode()).isEqualTo(-1);
    }

    @Test
    void oversizedOutputIsTruncated() {
        assumeTrue(pythonAvailable(), "python not on PATH — skipping");
        ExecResult r = svc.run(Language.PYTHON, "print('x' * 50000)", null);
        assertThat(r.truncated()).isTrue();
    }
}
