package com.example.nomute

import android.content.Context
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.nomute.theme.NoMuteTheme
import com.example.nomute.ui.main.PrankScreen
import kotlin.random.Random

class MainActivity : ComponentActivity() {

    private var mediaPlayer: MediaPlayer? = null
    private var isPlaying = false

    private val handler = Handler(Looper.getMainLooper())
    private val volumeEnforcerRunnable = object : Runnable {
        override fun run() {
            if (isPlaying) {
                val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
                val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
                val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
                
                // If they tried to drag the slider down, force it instantly to MAX!
                if (currentVolume < maxVolume) {
                    audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxVolume, 0)
                }
            }
            handler.postDelayed(this, 100) // Check 10 times a second!
        }
    }

    private val prankMessages = listOf(
        "Volume Down detected! Amplifying Android Gain! 🔊",
        "Nice try! Hardware buttons bypassed! 💥",
        "SILENCE DENIED! Escalate volume to maximum! 🔥",
        "Did you really think there was an off switch? 😎",
        "CAN YOU HEAR IT NOW? 👂",
        "Overdriving Android AudioStream to compensate! ⚡",
        "Volume keys converted to SUPER-LOUD! 🌀"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Prevent the phone from sleeping, show the app OVER the lock screen, and force max brightness!
        window.addFlags(
            android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            android.view.WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            android.view.WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )
        
        // Force the screen to Maximum Brightness!
        val layoutParams = window.attributes
        layoutParams.screenBrightness = 1.0f
        window.attributes = layoutParams

        // Instantly force max volume the exact second the app is opened!
        val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxVolume, 0)

        // Trap the Back button!
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (isPlaying) {
                    Toast.makeText(this@MainActivity, "NO ESCAPE! 🔒", Toast.LENGTH_SHORT).show()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        enableEdgeToEdge()
        setContent {
            NoMuteTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    PrankScreen(onPlayClicked = {
                        startAudio()
                    })
                }
            }
        }
    }

    private fun startAudio() {
        if (mediaPlayer == null) {
            mediaPlayer = MediaPlayer.create(this, R.raw.prank_audio)
            mediaPlayer?.isLooping = true
        }
        mediaPlayer?.start()
        isPlaying = true
        
        // Start the aggressive volume enforcer loop
        handler.post(volumeEnforcerRunnable)
        
        Toast.makeText(this, "Audio started! Native Auto-Compensator ACTIVE! 💥", Toast.LENGTH_SHORT).show()
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        // Hijack ALL Volume buttons!
        if (isPlaying && (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || 
                          keyCode == KeyEvent.KEYCODE_VOLUME_UP || 
                          keyCode == KeyEvent.KEYCODE_VOLUME_MUTE)) {
            
            val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
            val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
            
            val newVolume = if (currentVolume < maxVolume) currentVolume + 1 else maxVolume
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, newVolume, 0)

            val randomMsg = prankMessages[Random.nextInt(prankMessages.size)]
            Toast.makeText(this, randomMsg, Toast.LENGTH_SHORT).show()
            
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(volumeEnforcerRunnable)
        mediaPlayer?.release()
        mediaPlayer = null
    }
}
