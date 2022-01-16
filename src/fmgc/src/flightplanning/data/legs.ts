// Copyright (c) 2021 FlyByWire Simulations
// Copyright (c) 2021 Synaptic Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { getAltitudeConstraintFromWaypoint, getSpeedConstraintFromWaypoint } from '@fmgc/guidance/lnav/legs';

export enum AltitudeConstraintType {
    At,
    AtOrAbove,
    AtOrBelow,
    Range,
}

export enum SpeedConstraintType {
    At,
    AtOrAbove,
    AtOrBelow,
}

export interface AltitudeConstraint {
    type: AltitudeConstraintType,
    altitude1: Feet,
    altitude2: Feet | undefined,
}

export interface SpeedConstraint {
    type: SpeedConstraintType,
    speed: Knots,
}

export interface LegEditableData {

    /**
     * Altitude constraint applicable to this leg
     */
    altitudeConstraint?: AltitudeConstraint,

    /**
     * Speed constraint applicable to this leg
     */
    speedConstraint?: SpeedConstraint,

    /**
     * UTC seconds required time of arrival applicable to the leg
     */
    rtaUtcSeconds?: Seconds,

    /**
     * Whether the termination of this leg must be overflown. The termination can be overflown even if this is `false` due to geometric constraints
     */
    isOverfly?: boolean,

    /**
     * Lateral offset applicable to this leg. -ve if left offset, +ve if right offset.
     *
     * This also applies if this is the first or last leg considered "offset" in the FMS, even if the transition onto the offset path skips the leg.
     */
    offset?: NauticalMiles,

}

export function legEditableDataFromMsfsWaypoint(waypoint: WayPoint): LegEditableData {
    const altitudeConstraint = getAltitudeConstraintFromWaypoint(waypoint);
    const speedConstraint = getSpeedConstraintFromWaypoint(waypoint);

    return {
        altitudeConstraint,
        speedConstraint,
        isOverfly: waypoint.additionalData.overfly,
    };
}
