#define PIN_RADIO_RX 2
#define PIN_RADIO_TX 3

#include "radio.h"

void setup() {
  Serial.begin(9600);
  pinMode(12, OUTPUT);
  digitalWrite(12, LOW);
  pkt_initRadio();
}

void loop() {
  digitalWrite(12, HIGH);
  pkt_update();
  Sound sound;
  sound.data.level = millis();
  Serial.println(sound.data.level);
  pkt_sendSound(&sound);
  delay(100);
}
