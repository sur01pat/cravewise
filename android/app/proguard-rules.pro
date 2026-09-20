# ─────────────────────────────────────────────────────────────────────────────
# CraveWise — R8 / ProGuard rules
#
# Strategy: keep ONLY what R8 cannot safely rename/remove on its own.
# Everything else is obfuscated and shrunk — this maximises the obfuscation
# percentage reported by the Play Store and reduces DEX size.
#
# Rules are organised by WHY each class must be kept:
#   JNI   — native code loads the class by exact name
#   REFL  — class/method looked up by string at runtime
#   ENTRY — Android / Expo framework entry point
#   SERIAL — serialised/parcelled across process boundaries
# ─────────────────────────────────────────────────────────────────────────────


# ── App entry points (ENTRY) ─────────────────────────────────────────────────

-keep public class com.cravewise.app.MainActivity
-keep public class com.cravewise.app.MainApplication


# ── React Native — JNI bridge (JNI) ─────────────────────────────────────────
# The C++ JSI layer dlopen()s these by exact name. Only the minimal set needed.

-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.bridge.CxxModuleWrapper { *; }
-keep class com.facebook.react.bridge.JavaScriptExecutor { *; }
-keep class com.facebook.react.bridge.JavaScriptExecutorFactory { *; }
-keep class com.facebook.react.bridge.queue.MessageQueueThreadSpec { *; }
-keep class com.facebook.react.common.MapBuilder { *; }

# New Architecture — TurboModule codegen produces classes looked up by name
-keep @com.facebook.react.bridge.ReactModule class * { *; }
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
    @com.facebook.react.bridge.ReactProp <methods>;
    @com.facebook.react.bridge.ReactPropGroup <methods>;
}

# Fabric renderer — ViewManager subclasses registered by name
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }
-keep class * extends com.facebook.react.uimanager.SimpleViewManager { *; }

# ReactPackage implementations scanned at startup
-keep class * implements com.facebook.react.ReactPackage { *; }

# JSI Host objects passed across the bridge
-keepclassmembers class * extends com.facebook.react.bridge.JavaOnlyMap { *; }
-keepclassmembers class * extends com.facebook.react.bridge.JavaOnlyArray { *; }


# ── Hermes (JNI) ─────────────────────────────────────────────────────────────

-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.hermes.reactexecutor.** { *; }


# ── Expo modules (REFL) ──────────────────────────────────────────────────────
# Expo scans the classpath for ExpoModule subclasses by reflection.

-keep class * extends expo.modules.kotlin.modules.Module { *; }
-keep class * extends expo.modules.core.BasePackage { *; }
-keepclassmembers class * extends expo.modules.kotlin.modules.Module {
    public <init>(...);
}


# ── Google Mobile Ads / AdMob (REFL + JNI) ──────────────────────────────────
# GMA SDK uses reflection for mediation adapter discovery and JNI internally.

-keep class com.google.android.gms.ads.MobileAds { *; }
-keep class com.google.android.gms.ads.AdRequest { *; }
-keep class com.google.android.gms.ads.AdRequest$Builder { *; }
-keep class com.google.android.gms.ads.AdView { *; }
-keep class com.google.android.gms.ads.AdSize { *; }
-keep class com.google.android.gms.ads.initialization.** { *; }
-keep class com.google.android.gms.ads.mediation.** { *; }
-keep class com.google.android.ump.** { *; }

# Suppress warnings for classes only present on device
-dontwarn com.google.android.gms.**


# ── AsyncStorage (REFL) ──────────────────────────────────────────────────────

-keep class com.reactnativecommunity.asyncstorage.AsyncStorageModule { *; }
-keep class com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier { *; }


# ── React Native Screens (REFL) ──────────────────────────────────────────────

-keep class com.swmansion.rnscreens.RNScreensPackage { *; }


# ── React Native Safe Area Context (REFL) ────────────────────────────────────

-keep class com.th3rdwave.safeareacontext.SafeAreaContextPackage { *; }


# ── Android framework — serialisation (SERIAL) ───────────────────────────────

-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}

-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}


# ── Annotations & debug info ─────────────────────────────────────────────────

# Preserve annotations used for runtime lookup
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions

# Keep source file + line numbers in stack traces (crash reporting)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile


# ── Kotlin metadata (REFL) ───────────────────────────────────────────────────
# kotlin-reflect reads this to discover function signatures at runtime.

-keep class kotlin.Metadata { *; }
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}
-dontwarn kotlin.**
-dontwarn kotlinx.**


# ── OkHttp / Okio (used by several SDKs internally) ─────────────────────────

-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
