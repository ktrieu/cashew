export interface Location {
    x: number,
    y: number,
    map: number
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