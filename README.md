# NoMute 🔊
The ultimate high-performance audio tool for Android—you must try this app at least once to experience true, uninterrupted sound control!

## 🏗 Architecture Diagram

```mermaid
graph TD
    User([Professional]) -->|Opens App| A(MainActivity)
    A -->|Instantly| B[Calibrate Optimal Volume]
    User -->|Initiates Session| C{Audio Engine}
    C -->|Starts| D[High-Fidelity MediaPlayer]
    C -->|Spins up| E((Persistent Focus Loop))
    
    E -.->|Every 100ms| F{Monitor System Volume}
    F -->|Dip Detected| G[Restore to Peak Level]
    F -->|Stable| H[Maintain State]
    
    User -->|Accidental Key Press| I[Hardware Stabilizer]
    I -->|Intercepts Event| G
    I -->|Shows Toast| J[Status Update]
    
    User -->|Accidental Back Swipe| K[Immersive Mode]
    K -->|Maintains Session| L[Keeps UI Active]

    
