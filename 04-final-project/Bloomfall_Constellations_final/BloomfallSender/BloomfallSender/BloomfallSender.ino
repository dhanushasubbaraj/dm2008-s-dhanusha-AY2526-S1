// ============================================================
// BloomfallSender.ino — Stable pressure-sensor sender for Bloomfall
// Hardware: FSR/pressure sensor to A0 with a 10k pulldown (voltage divider).
// Sends "1" for tap (short) and "2" for long press (>=450 ms).
// TX is quiet when idle.
// ============================================================

const int PIN_SENSOR = A0;

// Tune for your sensor (10-bit ADC 0..1023)
const int THRESH_ON   = 120;   // go "pressed" above this
const int THRESH_OFF  = 90;    // release below this (hysteresis)
const unsigned long LONG_MS = 450;         // long press threshold
const unsigned long REFRACTORY_MS = 280;   // min gap between events

unsigned long pressStart = 0;
bool pressed = false;
unsigned long lastEventMs = 0;

// 1/8 moving average
int avg = 0;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_SENSOR, INPUT);
  delay(300);
  Serial.println("# BloomfallSender ready");  // one-time banner
}

void loop() {
  int v = analogRead(PIN_SENSOR);
  avg = (avg * 7 + v) / 8;

  unsigned long now = millis();

  // rising edge: idle -> pressed
  if (!pressed && avg > THRESH_ON && (now - lastEventMs) > REFRACTORY_MS) {
    pressed = true;
    pressStart = now;
  }

  // falling edge: pressed -> released
  if (pressed && avg < THRESH_OFF) {
    pressed = false;
    lastEventMs = now;

    unsigned long dur = now - pressStart;
    if (dur >= LONG_MS) Serial.println("2");
    else                Serial.println("1");
  }

  delay(5); // stability; low latency
}
