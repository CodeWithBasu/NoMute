# NoMute 🔊💀

NoMute is a prank Android application designed to trap the user with inescapable, max-volume audio. Once activated, the app aggressively intercepts volume hardware buttons and system sliders, rendering the user completely unable to lower the volume!

## Project Structure

Here is a detailed breakdown of the Android folder structure to help you navigate the codebase:

```text
NoMute/
├── .gradle/                  # Hidden folder: Contains Gradle cache
├── .idea/                    # Hidden folder: Android Studio settings
├── app/                      # ⭐️ THE MAIN FOLDER ⭐️ - This contains all your actual app code!
│   ├── build/                # Auto-generated when you hit "Run". Contains your compiled app-debug.apk!
│   ├── src/
│   │   └── main/             # The main source code directory
│   │       ├── java/com/example/nomute/  # Your Kotlin Code!
│   │       │   ├── MainActivity.kt       # The "Brain" of the app. This is where we put the Volume Enforcer, Back Button Trap, and Key Interceptors!
│   │       │   ├── theme/                # Contains color and typography settings
│   │       │   └── ui/main/
│   │       │       └── PrankScreen.kt    # The "Face" of the app. This is the Jetpack Compose UI containing the Liquid Metal graphics and play button.
│   │       │
│   │       ├── res/          # Your Resources (Images, Sounds, Icons)
│   │       │   ├── drawable/ # Vector graphics and XML shapes go here
│   │       │   ├── mipmap/   # Your App Icons! (Android Studio generates different sizes like hdpi, xhdpi, etc. here)
│   │       │   ├── raw/      
│   │       │   │   └── prank_audio.mp3   # The audio file you uploaded! Anything in "raw" can be played by MediaPlayer.
│   │       │   └── values/   # XML files for strings (app name) and colors
│   │       │
│   │       └── AndroidManifest.xml       # The ID card for your app.
│   │
│   └── build.gradle.kts      # The App-Level build script.
│
├── gradle/wrapper/           # Contains the Gradle wrapper tools.
├── build.gradle.kts          # The Project-Level build script.
└── settings.gradle.kts       # Tells Gradle which modules to include.
```

## Features
- **Volume Key Hijacking:** Intercepts volume down, volume up, and mute keys to instantly jump to 100% volume.
- **Aggressive Background Enforcer:** A background loop runs 10x a second to forcefully correct the volume if the user tries to turn it down via the Android Control Center.
- **No Escape (Back Button Trap):** Disables the Android back button so the user is trapped on the screen.
- **Startup Volume Max:** Instantly sets the media volume to 100% the exact millisecond the app is opened, before they even hit play!
