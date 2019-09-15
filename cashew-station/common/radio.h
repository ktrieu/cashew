#pragma once

#include <SoftwareSerial.h>

#define PKT_BEGIN 02
#define PKT_END 03

SoftwareSerial pkt_radio(0, 1);

void pkt_initRadio() {
  pkt_radio.begin(9600);
}

uint8_t pkt_readByte() {
  uint8_t byte;
  pkt_radio.readBytes(&byte, 1);
  return byte;
}

#define HEADER_SIZE 3

enum PacketType {
  NONE = 0,
  SOUND = 1,
};

enum PktState {
  WAIT_HEADER,
  WAIT_PAYLOAD,
  PKT_RECIEVED
};

PktState pkt_state = WAIT_HEADER;

PacketType pkt_payloadType;
size_t pkt_payloadSize;
uint8_t pkt_payload[20];

bool pkt_available() {
  return (pkt_state == PKT_RECIEVED);
}

void pkt_update() {
  if (pkt_state == WAIT_HEADER) {
    if (pkt_radio.available() >= HEADER_SIZE) {
      uint8_t startByte = pkt_readByte();
      if (startByte != PKT_BEGIN) {
        return;
      }
      pkt_payloadType = (PacketType)pkt_readByte();
      pkt_payloadSize = (size_t)pkt_readByte();
      pkt_state = WAIT_PAYLOAD;
    }
  }
  if (pkt_state == WAIT_PAYLOAD) {
    //add one for the message end marker
    if (pkt_radio.available() >= pkt_payloadSize + 1) {
      for (int i = 0; i < pkt_payloadSize; i++) {
        uint8_t byte = pkt_readByte();
        pkt_payload[i] = byte;
      }
      //dispose of the end marker
      pkt_readByte();
      pkt_state = PKT_RECIEVED;
    }
  }
}

uint8_t* pkt_readPacket() { 
  pkt_state = WAIT_HEADER;
  return pkt_payload;
}

void pkt_send(PacketType type, uint8_t* data, size_t size) {
  pkt_radio.write((uint8_t)PKT_BEGIN);
  pkt_radio.write((uint8_t)type);
  pkt_radio.write((uint8_t)size);
  for (int i = 0; i < size; i++) {
    uint8_t byte = data[i];
    pkt_radio.write(byte);
  }
  pkt_radio.write((uint8_t)PKT_END);
}

//PACKET: SOUND

typedef struct _Sound {
  int level;
};

typedef union Sound {
  _Sound data;
  uint8_t bytes[sizeof(_ControlAck)];
};

void pkt_sendSound(Sound* sound) {
  size_t size = sizeof(_Sound);
  pkt_send(SOUND, sound->bytes, size);
}

Sound pkt_readSound() {
  uint8_t* payload = pkt_readPacket();
  Sound sound;
  for (int i = 0; i < sizeof(Sound); i++) {
    sound.bytes[i] = payload[i];
  }
  return ack;
}
