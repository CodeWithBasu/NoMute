package com.example.nomute.ui.main

import android.graphics.RenderEffect
import android.graphics.RuntimeShader
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ShaderBrush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

const val SHADER = """
    uniform float2 resolution;
    uniform float time;
    
    half4 main(float2 fragCoord) {
        float2 uv = fragCoord / resolution.xy;
        float2 p = uv * 2.0 - 1.0;
        
        float a = time * 2.0;
        float d, e, f, g = 1.0 / 40.0, h, i, r, q;
        
        e = 400.0 * (p.x * 0.5 + 0.5);
        f = 400.0 * (p.y * 0.5 + 0.5);
        i = 200.0 + sin(e * g + a / 150.0) * 20.0;
        d = 200.0 + cos(f * g / 2.0) * 18.0 + cos(e * g) * 7.0;
        r = sqrt(pow(abs(i - e), 2.0) + pow(abs(d - f), 2.0));
        q = f / r;
        e = (r * cos(q)) - a / 2.0;
        f = (r * sin(q)) - a / 2.0;
        d = sin(e * g) * 176.0 + sin(e * g) * 164.0 + r;
        h = ((f + d) + a / 2.0) * g;
        i = cos(h + r * p.x / 1.3) * (e + e + a) + cos(q * g * 6.0) * (r + h / 3.0);
        h = sin(f * g) * 144.0 - sin(e * g) * 212.0 * p.x;
        h = (h + (f - e) * q + sin(r - (a + h) / 7.0) * 10.0 + i / 4.0) * g;
        i += cos(h * 2.3 * sin(a / 350.0 - q)) * 184.0 * sin(q - (r * 4.3 + a / 12.0) * g) + tan(r * g + h) * 184.0 * cos(r * g + h);
        i = mod(i / 5.6, 256.0) / 64.0;
        if (i < 0.0) i += 4.0;
        if (i >= 2.0) i = 4.0 - i;
        d = r / 350.0;
        d += sin(d * d * 8.0) * 0.52;
        f = (sin(a * g) + 1.0) / 2.0;
        
        // Sleek metallic purple/blue liquid
        return half4(
            half(i * d * 0.7),
            half(i * d * 0.4),
            half(i * d * 0.9 + 0.2),
            1.0
        );
    }
"""

@Composable
fun PrankScreen(onPlayClicked: () -> Unit) {
    var isPlaying by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F0F13)), // Dark aesthetic background
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (!isPlaying) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                LiquidMetalButton {
                    isPlaying = true
                    onPlayClicked()
                }
            } else {
                // Fallback for older Android versions
                Box(
                    modifier = Modifier
                        .size(200.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF8B5CF6))
                        .clickable {
                            isPlaying = true
                            onPlayClicked()
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Text("PLAY AUDIO", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            Text(
                text = "PRESS TO START AUDIO EXPERIENCE",
                color = Color.Gray,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp
            )
        } else {
            Text(
                text = "Exponential Volume Auto-Compensator Active",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(32.dp)
            )
            Text(
                text = "Pressing Volume Down on your phone boosts volume instead! 😎",
                color = Color(0xFFF472B6), // pink-400
                fontSize = 14.sp
            )
        }
    }
}

@RequiresApi(Build.VERSION_CODES.TIRAMISU)
@Composable
fun LiquidMetalButton(onClick: () -> Unit) {
    val shader = remember { RuntimeShader(SHADER) }
    val infiniteTransition = rememberInfiniteTransition(label = "time")
    val time by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 100f,
        animationSpec = infiniteRepeatable(
            animation = tween(20000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ), label = "time"
    )

    Box(
        modifier = Modifier
            .size(200.dp)
            .clip(CircleShape)
            .drawBehind {
                shader.setFloatUniform("resolution", size.width, size.height)
                shader.setFloatUniform("time", time)
                drawRect(brush = ShaderBrush(shader))
            }
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text("PLAY", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 28.sp)
    }
}
