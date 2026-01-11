declare global {
  interface Window {
    EFB_V3_BRIDGE: EfbV3ControlInterface | undefined;

    EFB_V4_BRIDGE: EfbV4ControlInterface | undefined;
  }
}

/**
 * Common EFB pages across EFBv3 and EFBv4
 */
export enum EfbCommonPages {
  Dashboard,
  Dispatch,
  Ground,
  Performance,
  Navigation,
  ATC,
  Failures,
  Checklists,
  Presets,
  Settings,
}

/**
 * Bridge for communicating to the EFBv3 instrument
 */
export interface EfbV3ControlInterface {
  /**
   * Sets the active page on the EFBv3 instrument
   * @param page The page to set as active
   */
  setActivePage(page: EfbCommonPages): void;

  /**
   * Opens the quick settings on the EFBv3 instrument
   */
  openQuickSettings(): void;

  /**
   * Opens the troubleshooting page on the EFBv3 instrument
   */
  openTroubleshootingPage(): void;
}

/**
 * Bridge for communicating to the EFBv4 instrument
 */
export interface EfbV4ControlInterface {
  /**
   * Updates the troubleshooting status on the EFBv4 instrument
   * @param hasTroubleshootingIssue Whether there is a troubleshooting issue
   */
  updateTroubleshootingStatus(hasTroubleshootingIssue: boolean): void;
}

/**
 * Gets the EFBv3 bridge instance
 * @returns The EFBv3 bridge instance, or undefined if it doesn't exist
 */
export function getEfbV3Bridge(): EfbV3ControlInterface | undefined {
  return window.EFB_V3_BRIDGE;
}

/**
 * Gets the EFBv4 bridge instance
 * @returns The EFBv4 bridge instance, or undefined if it doesn't exist
 */
export function getEfbV4Bridge(): EfbV4ControlInterface | undefined {
  return window.EFB_V4_BRIDGE;
}
