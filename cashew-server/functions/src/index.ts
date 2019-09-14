import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { Station } from '../../../cashew-common/common';

admin.initializeApp();

export const stationUpdate = functions.https.onRequest(async (request, response) => {
    let station = <Station>request.body;
    let ref = admin.database().ref(`stations`).child(station.id.toString());
    await ref.update(station);
    response.json(ref.toJSON());
})

export const getStation = functions.https.onRequest(async (request, response) => {
    let snapshot = await admin.database().ref('stations').child(request.query.id).once('value');
    response.json(snapshot.val());
})

export const getAllStations = functions.https.onRequest(async (request, response) => {
    let snapshot = await admin.database().ref('stations').orderByKey().once('value');
    response.json(snapshot.val());
})