import { EventBus, MappedSubject, MathUtils, SimVarValueType, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { ModalKind, showModal } from 'instruments/src/EFBv4/Components/Modal';
import { EFBSimvars } from 'instruments/src/EFBv4/EFBSimvarPublisher';
import { RegisteredSimVar } from '@shared/SimVarUtils';

const BATTERY_DURATION_CHARGE_MIN = 180;
const BATTERY_DURATION_DISCHARGE_MIN = 540;

class Battery {
  private charge: number;
  private lastChangeTimestamp: number;

  public constructor(initialCharge: number, lastChangeTimestamp: number) {
    this.charge = initialCharge;
    this.lastChangeTimestamp = lastChangeTimestamp;
  }

  public update(absoluteTime: number, powerBeingSupplied: boolean): number {
    const deltaTs = Math.max(absoluteTime - this.lastChangeTimestamp, 0);
    const batteryDurationSec = powerBeingSupplied
      ? BATTERY_DURATION_CHARGE_MIN * 60
      : -BATTERY_DURATION_DISCHARGE_MIN * 60;

    const deltaCharge = (100 * deltaTs) / batteryDurationSec;
    const newCharge = MathUtils.clamp(this.charge + deltaCharge, 0, 100);

    // FIXME for purposes of encapsulation, this very likely shouldn't be here but ill let it slide 😏😏😎
    if (this.charge > 20 && newCharge <= 20) {
      showModal({
        kind: ModalKind.Alert,
        title: 'Battery Low',
        bodyText: 'The battery is getting very low. Please charge the battery soon.',
      });
    }

    this.charge = newCharge;
    this.lastChangeTimestamp = absoluteTime;

    return newCharge;
  }

  /** This method updates the battery's last recorded change timestamp so that large depletions do not happen when power is suddenly restored after being shut off for prolonged periods of time */
  onChargeStopStart(absoluteTime: number) {
    this.lastChangeTimestamp = absoluteTime;
  }
}

export enum PowerStates {
  SHUTOFF,
  SHUTDOWN,
  STANDBY,
  LOADING,
  LOADED,
  EMPTY,
}

export class PowerManager {
  private static readonly AbsoluteTimeSimVar = RegisteredSimVar.create<number>(
    'E:ABSOLUTE TIME',
    SimVarValueType.Seconds,
  );

  private static readonly Dc2BusIsPoweredSimVar = RegisteredSimVar.createBoolean('L:A32NX_ELEC_DC_2_BUS_IS_POWERED');

  private static PowerStateSimVar = RegisteredSimVar.create<number>('L:A32NX_EFB_POWER_STATE', SimVarValueType.Number);

  private readonly battery = new Battery(100, PowerManager.AbsoluteTimeSimVar.get());

  private readonly powerState = Subject.create(PowerStates.SHUTOFF as PowerStates);

  private readonly isBatteryChargeDischargeBeingSimulated = MappedSubject.create(
    ([batteryLifeEnabled, powerState]) => {
      return powerState === PowerStates.LOADED && batteryLifeEnabled;
    },
    this.batteryLifeEnabled,
    this.powerState,
  );

  private readonly isCharging = Subject.create(PowerManager.Dc2BusIsPoweredSimVar.get());

  private readonly charge = Subject.create(100);

  public constructor(
    bus: EventBus,
    private readonly batteryLifeEnabled: Subscribable<boolean>,
  ) {
    const efbSimvarSubscriber = bus.getSubscriber<EFBSimvars>();

    // FIXME why do we use both published simvars and static accesses?
    efbSimvarSubscriber.on('dc2BusIsPowered').handle((isPowered) => {
      this.isCharging.set(isPowered);
      this.battery.onChargeStopStart(PowerManager.AbsoluteTimeSimVar.get());
    });

    efbSimvarSubscriber.on('absoluteTime').handle((time) => {
      this.updateCharge(time);
    });

    this.isBatteryChargeDischargeBeingSimulated.sub(() =>
      this.battery.onChargeStopStart(PowerManager.AbsoluteTimeSimVar.get()),
    );

    this.powerState.sub((state) => PowerManager.PowerStateSimVar.set(state));
  }

  public get power(): Subscribable<PowerStates> {
    return this.powerState;
  }

  public get isBatteryCharging(): Subscribable<boolean> {
    return this.isCharging;
  }

  public get batteryCharge(): Subscribable<number> {
    return this.charge;
  }

  private updateCharge(absoluteTime: number) {
    if (!this.isBatteryChargeDischargeBeingSimulated.get()) return;

    const newCharge = this.battery.update(absoluteTime, this.isCharging.get());
    this.charge.set(newCharge);

    if (newCharge <= 0) {
      this.powerState.set(PowerStates.EMPTY);
    }

    if (newCharge > 2 && this.powerState.get() === PowerStates.EMPTY) {
      this.offToLoaded();
    }
  }

  public offToLoaded() {
    const shouldWait = this.powerState.get() === PowerStates.SHUTOFF || this.powerState.get() === PowerStates.EMPTY;
    this.powerState.set(PowerStates.LOADING);

    if (shouldWait) {
      setTimeout(() => {
        this.powerState.set(PowerStates.LOADED);
      }, 2500);
    } else {
      this.powerState.set(PowerStates.LOADED);
    }
  }

  public handlePowerButtonPress() {
    if (this.powerState.get() === PowerStates.STANDBY) {
      this.offToLoaded();
    } else {
      // TODO Get history to work
      //   history.push('/');
      this.powerState.set(PowerStates.STANDBY);
    }
  }
}
