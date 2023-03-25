import { EventBus, FmcOutputTemplate, FmcRenderer, FmcRendererOptions } from '@microsoft/msfs-sdk';

export interface Arinc7XXEvents {
    displayOutputToCdu: [number, FmcOutputTemplate],

    keyPressToSystem: string,
}

export class Arinc7XXFmcRenderer implements FmcRenderer {
    constructor(private readonly bus: EventBus, public readonly options: FmcRendererOptions) {
    }

    editOutputTemplate(output: FmcOutputTemplate, rowIndex: number) {
        this.bus.getPublisher<Arinc7XXEvents>().pub('displayOutputToCdu', [rowIndex, output]);
    }
}
