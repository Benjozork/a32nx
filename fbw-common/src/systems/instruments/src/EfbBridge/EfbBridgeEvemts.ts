import { PageEnum } from '../EFBv4';

export enum EfbPage {
  Dashboard,
  Dispatch,
  Ground,
  Performance,
  NavigationAndCharts,
  AirTrafficControl,
  Failures,
  Checklists,
  Presets,
  Settings,
}

export interface EfbV3ControlInterface {
  setActivePage(page: PageEnum.MainPage): void;

  openQuickSettings(): void;
}
