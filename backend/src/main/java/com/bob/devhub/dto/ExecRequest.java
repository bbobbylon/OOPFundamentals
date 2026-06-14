package com.bob.devhub.dto;

/**
 * A code-execution request. The language is taken from the URL path
 * ({@code POST /api/run/{language}}); this body carries the source and optional stdin.
 *
 * @param code  the source to run (size-capped by app.exec.max-code-bytes)
 * @param stdin optional text piped to the program's standard input
 */
public record ExecRequest(String code, String stdin) {}
