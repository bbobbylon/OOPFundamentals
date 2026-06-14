package com.bob.devhub.service.exec;

/**
 * Languages the runner can execute, with the source filename each is written to.
 * The actual interpreter command is resolved in {@link ExecutionService} (it
 * differs by OS and is configurable via {@code app.exec.cmd.*}).
 */
public enum Language {
    PYTHON("python", "main.py"),
    TYPESCRIPT("typescript", "main.ts"),
    SHELL("shell", "main.sh");

    public final String id;
    public final String fileName;

    Language(String id, String fileName) {
        this.id = id;
        this.fileName = fileName;
    }

    /** Maps a URL path value to a Language, or null if unsupported. */
    public static Language from(String value) {
        if (value == null) return null;
        String v = value.trim().toLowerCase();
        for (Language l : values()) {
            if (l.id.equals(v)) return l;
        }
        if (v.equals("ts")) return TYPESCRIPT;
        if (v.equals("py")) return PYTHON;
        if (v.equals("sh") || v.equals("bash")) return SHELL;
        return null;
    }
}
