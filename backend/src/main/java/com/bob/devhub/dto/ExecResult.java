package com.bob.devhub.dto;

/**
 * The outcome of running a snippet.
 *
 * @param language   the language id that ran (python|typescript|shell)
 * @param stdout     captured standard output (capped)
 * @param stderr     captured standard error (capped)
 * @param exitCode   process exit code (0 = success); -1 when killed on timeout
 * @param durationMs wall-clock time the process ran
 * @param timedOut   true if the run was killed for exceeding the time limit
 * @param truncated  true if stdout/stderr was cut off at the size cap
 */
public record ExecResult(
    String language,
    String stdout,
    String stderr,
    int exitCode,
    long durationMs,
    boolean timedOut,
    boolean truncated
) {}
