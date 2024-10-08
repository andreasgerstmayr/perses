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

import { Box, useTheme } from '@mui/material';
import { Span } from '@perses-dev/core';
import { TicksHeader } from '../Ticks';
import { Viewport, rowHeight } from '../utils';
import { TracingGanttChartOptions } from '../../gantt-chart-model';
import { Canvas } from './Canvas';

interface MiniGanttChartProps {
  options: TracingGanttChartOptions;
  rootSpan: Span;
  viewport: Viewport;
  setViewport: (v: Viewport) => void;
}

export function MiniGanttChart(props: MiniGanttChartProps) {
  const { options, rootSpan, viewport, setViewport } = props;
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `${theme.shape.borderRadius}px`,
      }}
    >
      <Box sx={{ position: 'relative', height: rowHeight, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <TicksHeader rootSpan={rootSpan} viewport={rootSpan} />
      </Box>
      <Canvas options={options} rootSpan={rootSpan} viewport={viewport} setViewport={setViewport} />
    </Box>
  );
}
