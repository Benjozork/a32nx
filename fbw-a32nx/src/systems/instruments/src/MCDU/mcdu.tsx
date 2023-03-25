import { FSComponent, EventBus, DisplayComponent, VNode } from '@microsoft/msfs-sdk';
import { Arinc7XXEvents } from './Arinc7XXFmcRenderer';

export const MCDU_GRID_WIDTH = 24;
export const MCDU_GRID_HEIGHT = 14;

export interface CharacterDataEntry {
    char: string,
    style: string
}

export interface McduComponentProps {
    bus: EventBus,
}

export class McduComponent extends DisplayComponent<McduComponentProps> {
    private readonly gridRef = FSComponent.createRef<HTMLDivElement>();

    private characterData: CharacterDataEntry[][] = [];

    private readonly gridElements: (HTMLSpanElement[])[] = [];

    onAfterRender(node: VNode) {
        super.onAfterRender(node);

        const arinc7XXSub = this.props.bus.getSubscriber<Arinc7XXEvents>();

        this.initialiseCharacterData();
        this.constructGrid();

        arinc7XXSub.on('displayOutputToCdu').handle(([startRowIndex, data]) => {
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const rowExistingCharData = this.characterData[startRowIndex + i];

                if (row[0]) {
                    const regex = /([^[\]\n]+)(\[[^[\]\n]+])*/g;

                    let matchedFragment = regex.exec(row[0]);

                    const fragments: RegExpExecArray[] = [];

                    while (matchedFragment !== null) {
                        fragments.push(matchedFragment);

                        matchedFragment = regex.exec(row[0]);
                    }

                    let editCellIndex = 0;
                    for (const fragment of fragments) {
                        const text = fragment[1];
                        const styles = fragment[2];

                        for (let j = 0; j < text.length; j++) {
                            const charEntry = rowExistingCharData[editCellIndex + j];

                            charEntry.char = text[j].replace('@LSB', '[').replace('@RSB', ']');
                            if (styles !== undefined) {
                                charEntry.style = styles.replace(/\[/, '').replace(/]/, '');
                            } else {
                                charEntry.style = '';
                            }
                        }

                        editCellIndex += text.length;
                    }
                }

                if (row[1]) {
                    const regex = /([^[\]\n]+)(\[[^[\]\n]+])*/g;

                    let matchedFragment = regex.exec(row[1]);

                    const fragments: RegExpExecArray[] = [];

                    while (matchedFragment !== null) {
                        fragments.push(matchedFragment);

                        matchedFragment = regex.exec(row[1]);
                    }

                    const totalFragmentLength = fragments.reduce((acc, el) => acc + el[1].length, 0);

                    let editCellIndex = MCDU_GRID_WIDTH - totalFragmentLength;
                    for (const fragment of fragments) {
                        const text = fragment[1];
                        const styles = fragment[2];

                        for (let j = 0; j < text.length; j++) {
                            const charEntry = rowExistingCharData[editCellIndex + j];

                            charEntry.char = text[j].replace('@LSB', '[').replace('@RSB', ']');
                            if (styles !== undefined) {
                                charEntry.style = styles.replace(/\[/, '').replace(/]/, '');
                            } else {
                                charEntry.style = '';
                            }
                        }

                        editCellIndex += text.length;
                    }
                }

                if (row[2]) {
                    const regex = /([^[\]\n]+)(\[[^[\]\n]+])*/g;

                    let matchedFragment = regex.exec(row[2]);

                    const fragments: RegExpExecArray[] = [];

                    while (matchedFragment !== null) {
                        fragments.push(matchedFragment);

                        matchedFragment = regex.exec(row[2]);
                    }

                    const totalFragmentLength = fragments.reduce((acc, el) => acc + el[1].length, 0);

                    let editCellIndex = Math.floor((MCDU_GRID_WIDTH / 2) - (totalFragmentLength / 2));
                    for (const fragment of fragments) {
                        const text = fragment[1];
                        const styles = fragment[2];

                        for (let j = 0; j < text.length; j++) {
                            const charEntry = rowExistingCharData[editCellIndex + j];

                            charEntry.char = text[j].replace('@LSB', '[').replace('@RSB', ']');
                            if (styles !== undefined) {
                                charEntry.style = styles.replace(/\[/, '').replace(/]/, '');
                            } else {
                                charEntry.style = '';
                            }
                        }

                        editCellIndex += text.length;
                    }
                }
            }

            this.reconcileCharacterDataWithGrid(startRowIndex);
        });
    }

    private initialiseCharacterData() {
        for (let i = 0; i < MCDU_GRID_HEIGHT; i++) {
            const rowCharData: CharacterDataEntry[] = [];

            for (let j = 0; j < MCDU_GRID_WIDTH; j++) {
                rowCharData.push({ char: '', style: '' });
            }

            this.characterData.push(rowCharData);
        }
    }

    private constructGrid() {
        const grid = this.gridRef.instance;

        grid.classList.add('mcdu-grid');

        for (let i = 0; i < MCDU_GRID_HEIGHT; i++) {
            const row = document.createElement('div');

            row.classList.add('mcdu-row');

            const cellArray = [];

            for (let j = 0; j < MCDU_GRID_WIDTH; j++) {
                const cell = document.createElement('span');

                cell.classList.add('mcdu-cell');

                cellArray.push(cell);
                row.appendChild(cell);
            }

            this.gridElements.push(cellArray);
            grid.appendChild(row);
        }
    }

    private reconcileCharacterDataWithGrid(startRowIndex: number) {
        for (let i = startRowIndex; i < this.characterData.length; i++) {
            const row = this.characterData[i];

            for (let j = 0; j < row.length; j++) {
                const char = row[j];
                const cell = this.gridElements[i][j];

                cell.textContent = char.char;
                cell.className = `${i % 2 == 0 ? 'mcdu-cell' : 'mcdu-cell mcdu-style-small'} ${char.style.split(/\s/).map((it) => `mcdu-style-${it}`).join(' ')}`;
            }
        }
    }

    render(): VNode | null {
        return <div ref={this.gridRef} />;
    }
}
