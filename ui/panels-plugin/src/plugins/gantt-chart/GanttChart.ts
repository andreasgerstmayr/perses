// Copyright 2024 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { PanelPlugin } from '@perses-dev/plugin-system';
import { createInitialGanttChartOptions, GanttChartOptions } from './gantt-chart-model';
import { GanttChartPanel } from './GanttChartPanel';

/**
 * The core GanttChart panel plugin for Perses.
 *
 * The UI/UX of this panel is based on Jaeger UI, licensed under Apache License, Version 2.0.
 * https://github.com/jaegertracing/jaeger-ui
 */
export const GanttChart: PanelPlugin<GanttChartOptions> = {
  PanelComponent: GanttChartPanel,
  // TODO: add a chart options editor plugin, for example:
  // panelOptionsEditorComponents: [{ label: 'Settings', content: ScatterChartOptionsEditorSettings }],
  supportedQueryTypes: ['TraceQuery'],
  createInitialOptions: createInitialGanttChartOptions,
};