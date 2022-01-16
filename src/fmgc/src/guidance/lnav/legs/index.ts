import { AltitudeConstraint, AltitudeConstraintType, SpeedConstraint, SpeedConstraintType } from '@fmgc/flightplanning/data/legs';

export function getAltitudeConstraintFromWaypoint(wp: WayPoint): AltitudeConstraint | undefined {
    if (wp.legAltitudeDescription && wp.legAltitude1) {
        const ac: Partial<AltitudeConstraint> = {};
        ac.altitude1 = wp.legAltitude1;
        ac.altitude2 = undefined;
        switch (wp.legAltitudeDescription) {
        case 1:
            ac.type = AltitudeConstraintType.At;
            break;
        case 2:
            ac.type = AltitudeConstraintType.AtOrAbove;
            break;
        case 3:
            ac.type = AltitudeConstraintType.AtOrBelow;
            break;
        case 4:
            ac.type = AltitudeConstraintType.Range;
            ac.altitude2 = wp.legAltitude2;
            break;
        default:
            break;
        }
        return ac as AltitudeConstraint;
    }
    return undefined;
}

export function getSpeedConstraintFromWaypoint(wp: WayPoint): SpeedConstraint | undefined {
    if (wp.speedConstraint) {
        const sc: Partial<SpeedConstraint> = {};
        sc.type = SpeedConstraintType.At;
        sc.speed = wp.speedConstraint;
        return sc as SpeedConstraint;
    }
    return undefined;
}

export function waypointToLocation(wp: WayPoint): LatLongData {
    const loc: LatLongData = {
        lat: wp.infos.coordinates.lat,
        long: wp.infos.coordinates.long,
    };
    return loc;
}
