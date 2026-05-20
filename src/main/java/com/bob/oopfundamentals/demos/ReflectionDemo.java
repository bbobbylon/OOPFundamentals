package com.bob.oopfundamentals.demos;

import com.bob.oopfundamentals.reflection.Important;
import com.bob.oopfundamentals.reflection.Service;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

/*
 * REFLECTION — looking at and using code as DATA at runtime.
 *
 *  With reflection you can:
 *    - inspect a class's fields, methods, constructors
 *    - read annotations
 *    - instantiate objects without calling `new` directly
 *    - invoke methods by name
 *
 *  This is how Spring, JUnit, Jackson, Hibernate, and basically every Java
 *  framework do their "magic" — they SCAN your classes at runtime.
 *
 *  Caveat: reflection is slower and less safe than direct calls. Use it
 *  sparingly — only when you genuinely need to operate on unknown classes.
 */
public class ReflectionDemo {

    public static void run() throws Exception {
        Section.header("23) REFLECTION & ANNOTATIONS",
                "Inspect and call code at runtime. The magic behind every Java framework.");

        // Get the runtime Class object — the JVM's record of "what is Service".
        Class<Service> klass = Service.class;
        System.out.println("    inspecting class: " + klass.getName());

        Section.subheader("List all declared fields");
        for (Field field : klass.getDeclaredFields()) {
            System.out.println("    field: " + field.getType().getSimpleName() + " " + field.getName());
        }

        Section.subheader("List all declared methods");
        for (Method method : klass.getDeclaredMethods()) {
            System.out.println("    method: " + method.getName() + "(" + method.getParameterCount() + " params)");
        }

        Section.subheader("Find every method tagged @Important — and invoke them");
        Service svc = klass.getDeclaredConstructor().newInstance();   // build one without using `new` directly
        for (Method method : klass.getDeclaredMethods()) {
            Important tag = method.getAnnotation(Important.class);
            if (tag == null) continue;

            System.out.println("    -> @Important method: " + method.getName()
                    + "   (reason: " + tag.reason() + ")");
            if (method.getParameterCount() == 0) {
                method.invoke(svc);                              // call it with no args
            } else if (method.getName().equals("chargeCustomer")) {
                method.invoke(svc, "Bobby", 49.99);              // dynamic invocation
            }
        }

        Section.subheader("Reading and modifying a field by reflection");
        Field nameField = klass.getDeclaredField("name");
        System.out.println("    svc.name (via reflection) before = " + nameField.get(svc));
        nameField.set(svc, "BillingService");
        System.out.println("    svc.name (via reflection) after  = " + nameField.get(svc));

        Section.takeaway(
                "Reflection lets code TREAT CODE AS DATA — scan classes at runtime.",
                "Annotations are tags carried into runtime; reflection reads them.",
                "This is how DI containers, ORMs, and test runners 'just know' what to call.",
                "It's powerful but slower than direct calls — reach for it only when needed.");
    }
}
