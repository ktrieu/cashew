import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export interface Location {
    x: number,
    y: number,
    floor: number
}

export interface Device {
    mac_address: number,
    signal_strength: number,
}

export interface Station {
    id: number,
	location: Location,
	devices: Device[],
	sound_level: number,
	last_updated: number,
}

admin.initializeApp();

export const stationUpdate = functions.https.onRequest(async (request, response) => {
    let station = <Station>request.body;
    let ref = admin.database().ref(`stations`).child(station.id.toString());
    await ref.update(station);
    response.json(ref.toJSON());
})