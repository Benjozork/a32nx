import {
    AbstractFmcPage,
    EventBus,
    FmcPageFactory,
    FmcRenderCallback,
    FmcRenderTemplate,
    FmcScratchpad,
    FmcScreen,
} from '@microsoft/msfs-sdk';
import { MCDU_GRID_HEIGHT, MCDU_GRID_WIDTH } from './mcdu';
import { Arinc7XXFmcRenderer } from './Arinc7XXFmcRenderer';

export class McduInternalPage extends AbstractFmcPage {
    /**
     * Ctor
     *
     * @param bus the event bus
     * @param screen the FMC screen instance
     * @param renderCallback the render callback
     */
    constructor(
        bus: EventBus,
        public readonly screen: FmcScreen<McduInternalPage>,
        public readonly renderCallback: FmcRenderCallback,
    ) {
        super(bus, screen);
    }

    render(): FmcRenderTemplate[] {
        return [];
    }
}

export class McduMenuPageFactory extends FmcPageFactory<McduInternalPage> {
    createPage(PageCtor: typeof McduInternalPage, bus: EventBus, screen: FmcScreen<McduInternalPage, any>, renderCallback: FmcRenderCallback): McduInternalPage {
        return new PageCtor(bus, screen, renderCallback);
    }
}

export class McduInternalSystem {
    private readonly screen: FmcScreen<McduInternalPage>;

    constructor(private readonly bus: EventBus) {
        this.screen = new FmcScreen<McduInternalPage>(
            bus,
            new McduMenuPageFactory(),
            {
                screenDimensions: {
                    cellWidth: MCDU_GRID_WIDTH,
                    cellHeight: MCDU_GRID_HEIGHT,
                },
            },
            new Arinc7XXFmcRenderer(bus, { screenCellWidth: MCDU_GRID_WIDTH, screenCellHeight: MCDU_GRID_HEIGHT, screenPXWidth: 1_024, screenPXHeight: 1_024 }),
            new FmcScratchpad(bus, { cellWidth: MCDU_GRID_WIDTH }, () => {}),
        );

        this.screen.addPageRoute('/menu', McduMenuPage);

        this.screen.navigateTo('/menu');
    }
}

class McduMenuPage extends McduInternalPage {
    render(): FmcRenderTemplate[] {
        return [
            [
                ['', '', 'MCDU MENU'],
                ['', 'SELECT '],
                ['<FMGC (REQ)[green]', 'NAV B/UP>'],
                [''],
                ['<ATSU'],
                [''],
                ['<AIDS'],
                [''],
                ['<CFDS'],
            ],
        ];
    }
}
