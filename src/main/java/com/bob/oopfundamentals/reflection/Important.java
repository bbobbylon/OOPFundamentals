package com.bob.oopfundamentals.reflection;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/*
 * A CUSTOM ANNOTATION.
 *
 *  Annotations are tags you attach to code. They carry metadata but don't
 *  themselves do anything at runtime — frameworks (or YOUR code) read them
 *  via reflection and decide how to react.
 *
 *  Two key meta-annotations:
 *    @Target          — where can this annotation be placed? (methods, fields, classes...)
 *    @Retention       — until when does it live? SOURCE (compiler-only),
 *                       CLASS (in .class file), or RUNTIME (visible via reflection)
 *
 *  For runtime reflection, you NEED RetentionPolicy.RUNTIME.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Important {
    String reason() default "";
}
