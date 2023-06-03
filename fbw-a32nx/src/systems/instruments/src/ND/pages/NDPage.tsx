// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { ComponentProps, DisplayComponent, Subject } from '@microsoft/msfs-sdk';

export abstract class NDPage<P extends ComponentProps = ComponentProps> extends DisplayComponent<P> {
    isVisible: Subject<boolean>;

    onShow(): void {
        // noop
    }

    onHide(): void {
        /// noop
    }
}
