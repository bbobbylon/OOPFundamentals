package com.bob.oopfundamentals.designpatterns;

import java.util.ArrayList;
import java.util.List;

/*
 * OBSERVER pattern — "tell me when something happens."
 *
 *  A SUBJECT (NewsAgency) keeps a list of OBSERVERS (Subscribers). When the
 *  subject's state changes, it loops through and notifies each observer.
 *
 *  This is how UI event listeners, pub/sub systems, and reactive frameworks
 *  work under the hood.
 */
public class NewsAgency {

    public interface Subscriber {
        void onNews(String headline);
    }

    private final List<Subscriber> subscribers = new ArrayList<>();

    public void subscribe(Subscriber s)   { subscribers.add(s); }
    public void unsubscribe(Subscriber s) { subscribers.remove(s); }

    public void publish(String headline) {
        System.out.println("    [NewsAgency] publishing: " + headline);
        for (Subscriber s : subscribers) {
            s.onNews(headline);   // notify everyone
        }
    }
}
