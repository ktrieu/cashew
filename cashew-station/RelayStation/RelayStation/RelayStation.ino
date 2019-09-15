
#include "radio.h"

void setup() {
  Serial.begin(9600);
  pkt_initRadio();
}

void loop() {
  pkt_update();
  Sound sound;
  sound.data.level = millis();
  Serial.println(sound.data.level);
  pkt_sendSound(&sound);
  delay(100);
}
