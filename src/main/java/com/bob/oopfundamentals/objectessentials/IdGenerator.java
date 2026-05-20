package com.bob.oopfundamentals.objectessentials;

/*
 * STATIC vs INSTANCE.
 *
 *  - Instance members (no `static`) belong to a SINGLE OBJECT.
 *    Each `new Foo()` gets its own copy.
 *  - Static members belong to the CLASS itself — shared by everything.
 *    Useful for counters, constants, utility methods.
 *
 *  Below: nextId is static, so all callers share ONE counter. If we made
 *  it an instance field, each IdGenerator instance would start from 0 again.
 */
public class IdGenerator {

    // Shared across the whole program — exactly ONE of these, no matter how
    // many IdGenerators you instantiate.
    private static int nextId = 1000;

    /** static method: called as IdGenerator.newId(), no instance needed. */
    public static int newId() {
        int id = nextId;
        nextId = nextId + 1;
        return id;
    }
}
