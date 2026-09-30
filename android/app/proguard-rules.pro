# ─── React Native ────────────────────────────────────────────────────────────
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**

# ─── React Native Turbo Modules / New Architecture ───────────────────────────
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# ─── Expo Modules ────────────────────────────────────────────────────────────
-keep class expo.modules.** { *; }
-keep class com.swmansion.** { *; }      # react-native-screens, reanimated, gesture-handler
-keep class com.th3rdwave.safeareacontext.** { *; }
-dontwarn expo.modules.**

# ─── Google Mobile Ads / AdMob ───────────────────────────────────────────────
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.android.ump.** { *; }
-dontwarn com.google.android.gms.**

# ─── AsyncStorage ────────────────────────────────────────────────────────────
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ─── Hermes JS Engine ────────────────────────────────────────────────────────
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.hermes.intl.** { *; }

# ─── OkHttp / Networking ─────────────────────────────────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# ─── Prevent stripping of JS-callable native methods ─────────────────────────
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}
-keepclassmembers class *  {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# ─── Keep BuildConfig for JS bundle resolution ───────────────────────────────
-keep class com.cravewise.app.BuildConfig { *; }

# ─── Preserve enum values (used in native bridge) ────────────────────────────
-keepclassmembers enum * { *; }

# ─── Preserve Parcelable / Serializable ──────────────────────────────────────
-keepclassmembers class * implements android.os.Parcelable {
    static ** CREATOR;
}
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
