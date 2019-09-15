#pragma once

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>
#include <SoftwareSerial.h>

#define RADIO_RX 16
#define RADIO_TX 5

#include "radio.h"

const char *ssid =  "Hack the North";     // replace with your wifi ssid and wpa2 key
const char *pass =  "uwaterloo";
 
void setup() 
{
  Serial.begin(9600);
  while (!Serial); // Wait for serial connecion on USB

  Serial.println("");
  Serial.print("Connecting to ");
  Serial.print(ssid);
  Serial.print(" ");
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) 
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connection established");
  pkt_initRadio();
}

int soundSum = 0;
int soundSamples = 0;

void loop() {
  pkt_update();
  if (pkt_available()) {
    Serial.println("available");
    if (pkt_payloadType == SOUND) {
      Sound sound = pkt_readSound();
      Serial.println(sound.data.level);
    }
    else {
      pkt_readPacket();
    }
  }
  if (millis()%2000L == 0L){
    transmitSound();
    delay(10);
  }
  updateSound();
}

void updateSound(){
  soundSum += analogRead(A0);
  soundSamples++;
}

void transmitSound(){
  int sound = 10 * soundSum/soundSamples;
  soundSum = 0;
  soundSamples = 0;
  Serial.println(sound);
  HTTPClient http;
  http.begin("http://us-central1-cashew-2dd75.cloudfunctions.net/stationUpdate");
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(createJson(1, 80, 119, 0, sound, 0));
  http.end();
}

String createJson(int id, int x, int y, int level, int sound, int lastUpdate) {
  return "{ \"id\": " + String(id) + ", \"location\": { \"x\": " + String(x) + ", \"y\": " + String(y) + ", \"floor\": " + String(level) + " }, \"devices\": [ { \"mac_address\": 0, \"signal_strength\": 0 } ], \"sound_level\": " + String(sound) + ", \"last_updated\": " + String(lastUpdate) + " }";
}
