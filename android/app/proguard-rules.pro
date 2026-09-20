# ─────────────────────────────────────────────────────────────────────────────
# CraveWise — ProGuard / R8 rules
#
# minifyEnabled=true  →  R8 shrinks, obfuscates and optimises the DEX bytecode.
# shrinkResources=true → unused resources removed after dead-code elimination.
#
# Keep rules are additive: anything listed here is never removed or renamed
# even if R8 decides it is unreachable. Add rules for any library that uses
# reflection, JNI, or dynamic class loading.
# ─────────────────────────────────────────────────────────────────────────────


# ── React Native core ────────────────────────────────────────────────────────

# JSI / TurboModules / New Architecture — classes loaded by name at runtime
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# ReactActivity and ReactApplication entry points
-keep public class com.cravewise.app.MainActivity { *; }
-keep public class com.cravewise.app.MainApplication { *; }

# React Native TurboModule registry — looked up by string name
-keep class com.facebook.react.turbomodule.** { *; }
-keep interface com.facebook.react.turbomodule.** { *; }

# Fabric / New Renderer
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# JavaScript engine interface
-keep class com.facebook.react.bridge.** { *; }

# Prevent R8 from stripping @ReactModule and @ReactMethod annotations used
# for automatic module registration
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}


# ── Expo modules ─────────────────────────────────────────────────────────────

-keep class expo.modules.** { *; }
-keep interface expo.modules.** { *; }

# expo-modules-core module registry — modules discovered by reflection
-keep class expo.modules.core.** { *; }
-keep class expo.modules.kotlin.** { *; }


# ── Google Mobile Ads (AdMob) ────────────────────────────────────────────────

# AdMob SDK — loaded via reflection and JNI
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }

# User Messaging Platform (consent)
-keep class com.google.android.ump.** { *; }

# Prevent stripping AdMob's internal adapter classes
-keepclassmembers class * extends com.google.android.gms.ads.AdAdapter { *; }


# ── Async Storage ────────────────────────────────────────────────────────────

-keep class com.reactnativecommunity.asyncstorage.** { *; }


# ── React Native Screens ─────────────────────────────────────────────────────

-keep class com.swmansion.rnscreens.** { *; }


# ── React Native Safe Area Context ───────────────────────────────────────────

-keep class com.th3rdwave.safeareacontext.** { *; }


# ── Serialisation / reflection helpers ───────────────────────────────────────

# Preserve line numbers in stack traces for crash reporting
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep generic type signatures (required for Gson / Moshi / Retrofit if added later)
-keepattributes Signature
-keepattributes Exceptions

# Enum values used in switch statements after obfuscation
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Parcelable — Android serialisation
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}

# Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}


# ── Kotlin ────────────────────────────────────────────────────────────────────

# Kotlin coroutines use reflection for continuation labels
-keepclassmembernames class kotlinx.** {
    volatile <fields>;
}
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**


# ── OkHttp / networking (used internally by some SDKs) ───────────────────────

-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**


# ── Suppress known harmless warnings ─────────────────────────────────────────

-dontwarn com.facebook.react.**
-dontwarn com.google.android.gms.**
-dontwarn expo.modules.**
