import {
  ComponentProps,
  DisplayComponent,
  EventBus,
  FSComponent,
  HEvent,
  RenderPosition,
  Subject,
  VNode,
} from '@microsoft/msfs-sdk';

import { busContext } from './Contexts/EventBusContext';
import { flypadClientContext, initializeFlypadClientContext } from './Contexts/FlypadClientContext';

import { Navbar } from './Components/Navbar';
import { PageEnum } from './Shared/common';
import { Statusbar } from './Components/Statusbar';
import { FlypadClient } from '../../../shared/src/flypad-server/FlypadClient';

import './style.scss';
import './Assets/Theme.css';
import './Assets/Slider.scss';
import './Assets/bi-icons.css';

import { TooltipContainer } from './Components/Tooltip';
import { ModalContainer } from './Components/Modal';
import { PowerManager, PowerStates } from './Power';
import { Button } from './Components/Button';

import { FbwLogo } from './Assets/FbwLogo';
import { NotificationContainer } from './Components/Notification';
import { EfbV4FsInstrumentAircraftSpecificData } from './EfbV4FsInstrumentAircraftSpecificData';
import { NXDataStore } from '../../../shared/src/persistence';
import { TroubleshootingState } from './State/TroubleshootingState';
import { getEfbV3Bridge } from '../EfbBridge/EfbBridge';

interface EfbProps extends ComponentProps {
  aircraftSpecificData: EfbV4FsInstrumentAircraftSpecificData;
}

export class EFBv4 extends DisplayComponent<EfbProps, [EventBus]> {
  public override contextType = [busContext] as const;

  private readonly renderRoot = FSComponent.createRef<HTMLDivElement>();

  private readonly renderRoot2 = FSComponent.createRef<HTMLDivElement>();

  private readonly troubleshootingState = new TroubleshootingState();

  private readonly currentPage = Subject.create(PageEnum.MainPage.Dashboard);

  private get bus() {
    return this.getContext(busContext).get();
  }

  public onAfterRender(_node: VNode): void {
    const flypadClient = new FlypadClient(this.bus);

    initializeFlypadClientContext(flypadClient);

    flypadClient.initialized.on((it) => it.sendHelloWorld());

    const theme = NXDataStore.getSetting('EFB_UI_THEME').get();

    document.documentElement.classList.add(`theme-${theme}`, 'animationsEnabled');

    // FIXME seems like the power manager needs to be initialized here in this method... bus is probably not ready to use yet
    const powerManager = new PowerManager(this.bus, NXDataStore.getSetting('EFB_BATTERY_LIFE_ENABLED'));

    // FIXME v3 bridge, remove after no longer needed
    this.currentPage.sub((page) => {
      getEfbV3Bridge()?.setActivePage(PageEnum.MainPageToCommonPageMap[page]);
    });

    // FIXME v4 bridge, remove after no longer needed
    if (window.EFB_V4_BRIDGE === undefined) {
      window.EFB_V4_BRIDGE = {
        updateTroubleshootingStatus: (hasTroubleshootingIssue: boolean): void => {
          this.troubleshootingState.hasTroubleshootingIssue.set(hasTroubleshootingIssue);
        },
      };
    }

    const getComponentFromPowerState = (powerState: PowerStates): VNode => {
      switch (powerState) {
        case PowerStates.SHUTOFF:
        case PowerStates.STANDBY:
          return (
            <Button
              unstyled
              class="pointer-events-auto h-screen w-screen bg-black"
              onClick={() => powerManager.offToLoaded()}
            />
          );
        case PowerStates.LOADING:
        case PowerStates.SHUTDOWN:
          return (
            <div class="flex h-screen w-screen items-center justify-center bg-theme-body">
              <FbwLogo width={128} height={120} class="text-theme-text" />
            </div>
          );
        case PowerStates.EMPTY:
          return (
            <div class="flex h-screen w-screen items-center justify-center bg-black">
              <i class="bi-battery text-[128px] text-utility-red" />
            </div>
          );
        case PowerStates.LOADED:
          return (
            <>
              <Statusbar
                settingsPages={this.props.aircraftSpecificData.settingsPages}
                troubleshootingState={this.troubleshootingState}
                batteryLevel={powerManager.batteryCharge}
                isCharging={powerManager.isBatteryCharging}
              />
              <div class="flex grow items-stretch">
                <Navbar activePage={this.currentPage} />
                <div class="grow bg-transparent" />
              </div>
              <TooltipContainer />
              <NotificationContainer />
              <ModalContainer />
            </>
          );
      }
    };

    this.bus
      .getSubscriber<HEvent>()
      .on('hEvent')
      .handle((eventName) => {
        if (eventName === 'A32NX_EFB_POWER') {
          powerManager.handlePowerButtonPress();
        }
      });

    FSComponent.render(
      <flypadClientContext.Provider value={flypadClient}>
        <div ref={this.renderRoot2} class="flex w-full flex-col items-stretch" />
      </flypadClientContext.Provider>,
      this.renderRoot.instance,
    );

    powerManager.power.sub((powerState) => {
      this.renderRoot2.instance.innerHTML = '';

      FSComponent.render(getComponentFromPowerState(powerState), this.renderRoot2.instance, RenderPosition.In);
    }, true);
  }

  public render(): VNode {
    return (
      <div class="h-screen w-screen">
        <div ref={this.renderRoot} class="flex h-full w-full flex-row" />
      </div>
    );
  }
}
