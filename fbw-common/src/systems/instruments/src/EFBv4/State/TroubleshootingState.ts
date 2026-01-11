import { Subject } from '@microsoft/msfs-sdk';

export class TroubleshootingState {
  public readonly hasTroubleshootingIssue = Subject.create<boolean>(false);
}
