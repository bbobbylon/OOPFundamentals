package com.bob.oopfundamentals.designpatterns;

/*
 * SINGLETON pattern — exactly ONE instance of this class exists in the program.
 *
 *  When useful: app-wide config, connection pools, logging.
 *  Tactics:
 *    1) private constructor (so no one else can `new` it)
 *    2) a static field holding the only instance
 *    3) a static accessor (getInstance) that returns that one instance
 *
 *  Beware: singletons are global state — handy, but easy to misuse. In
 *  modern code you'd often inject them via DI instead of using getInstance().
 */
public class AppSettings {

    private static final AppSettings INSTANCE = new AppSettings();   // (1) eagerly built once

    private String theme = "dark";
    private int fontSize = 14;

    private AppSettings() {}                                          // (2) nobody else can build one

    public static AppSettings getInstance() { return INSTANCE; }      // (3) the one accessor

    public String getTheme()         { return theme; }
    public void setTheme(String t)   { this.theme = t; }
    public int getFontSize()         { return fontSize; }
    public void setFontSize(int s)   { this.fontSize = s; }
}
