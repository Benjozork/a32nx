import { Clock, EventBus, FSComponent, InstrumentBackplane } from '@microsoft/msfs-sdk';
import { McduComponent } from './mcdu';
import { McduInternalSystem } from './McduInternalSystem';

import './index.css';

class Mcdu extends BaseInstrument {
    private readonly bus = new EventBus();

    private backplane = new InstrumentBackplane();

    private readonly clock = new Clock(this.bus);

    private internalMcduScreen = new McduInternalSystem(this.bus);

    get templateID(): string {
        return 'A32NX_MCDU';
    }

    connectedCallback() {
        super.connectedCallback();

        this.backplane.addInstrument('clock', this.clock);
        this.backplane.init();

        FSComponent.render(<McduComponent bus={this.bus} />, document.getElementById('MCDU_CONTENT'));
    }

    protected Update() {
        super.Update();

        this.backplane.onUpdate();
    }
}

registerInstrument('a320-mcdu', Mcdu);
