package com.bob.oopfundamentals.solid;

/*
 * D — DEPENDENCY INVERSION PRINCIPLE
 *   "Depend on abstractions, not concrete classes."
 *
 *  Bad:  NotificationService directly creates `new EmailSender()`. Switching
 *        to SMS or push later means editing NotificationService.
 *
 *  Good: NotificationService depends on a `MessageSender` INTERFACE. The
 *        concrete sender is passed in (constructor injection). Now we can
 *        swap implementations without touching the service.
 *
 *  This is also the foundation of "dependency injection" frameworks (Spring,
 *  Guice, etc.) — they wire concrete classes into objects that ask only
 *  for abstractions.
 */
public class D_DependencyInversion {

    /** The abstraction the high-level code depends on. */
    public interface MessageSender {
        void send(String to, String message);
    }

    public static class EmailSender implements MessageSender {
        public void send(String to, String message) {
            System.out.println("    [Email] -> " + to + ": " + message);
        }
    }

    public static class SmsSender implements MessageSender {
        public void send(String to, String message) {
            System.out.println("    [SMS]   -> " + to + ": " + message);
        }
    }

    /** High-level policy. Doesn't know or care about Email vs SMS. */
    public static class NotificationService {
        private final MessageSender sender;   // depends on the abstraction

        public NotificationService(MessageSender sender) {
            this.sender = sender;
        }

        public void notifyUser(String user, String text) {
            sender.send(user, text);
        }
    }

    public static void demo() {
        // Same service, different concrete dependencies injected at construction.
        NotificationService viaEmail = new NotificationService(new EmailSender());
        NotificationService viaSms   = new NotificationService(new SmsSender());

        viaEmail.notifyUser("bobby@example.com", "Welcome!");
        viaSms.notifyUser("+1-555-1234",       "Welcome!");
        System.out.println("    -> Service depends on the INTERFACE; we plug in whichever sender we like.");
    }
}
