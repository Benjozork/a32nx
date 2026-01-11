// Copyright (c) 2025 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HashMismatchResult } from '../../Utils/fileHashes';

const initialState: { mismatches: HashMismatchResult[] } = { mismatches: [] };

export const fileHashesSlice = createSlice({
  name: 'fileHashes',
  initialState,
  reducers: {
    setFileHashMismatches: (state, action: PayloadAction<HashMismatchResult[]>) => {
      state.mismatches = action.payload;

      if (window.EFB_V4_BRIDGE) {
        window.EFB_V4_BRIDGE.updateTroubleshootingStatus(action.payload.length > 0);
      }
    },
  },
});

export const { setFileHashMismatches } = fileHashesSlice.actions;
export default fileHashesSlice.reducer;
