// Copyright (c) 2023-2025 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

import React from 'react';

import { QuickControlsPane } from './QuickControls';

interface StatusBarProps {
  showQuickControlsPane: boolean;
  setShowQuickControlsPane: (value: boolean | ((old: boolean) => boolean)) => void;
}

export const StatusBar = ({ showQuickControlsPane, setShowQuickControlsPane }: StatusBarProps) => {
  return showQuickControlsPane && <QuickControlsPane setShowQuickControlsPane={setShowQuickControlsPane} />;
};
