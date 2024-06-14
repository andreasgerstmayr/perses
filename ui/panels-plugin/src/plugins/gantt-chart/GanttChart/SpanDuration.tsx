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
import { formatTime } from './utils';
import { Ticks } from './Ticks';
import { Span, Viewport } from './model';

export interface SpanDurationProps {
  span: Span;
  viewport: Viewport;
}

/**
 * SpanDuration renders the right column of a SpanRow, i.e. the span bar and span duration
 */
export function SpanDuration(props: SpanDurationProps) {
  const { span, viewport } = props;
  const theme = useTheme();

  const spanDuration = span.endTimeUnixNano - span.startTimeUnixNano;
  const viewportDuration = viewport.endTimeUnixNano - viewport.startTimeUnixNano;
  const relativeDuration = spanDuration / viewportDuration;
  const relativeStart = (span.startTimeUnixNano - viewport.startTimeUnixNano) / viewportDuration;

  return (
    <Box sx={{ position: 'relative', height: '100%', flexGrow: 1, overflow: 'hidden' }}>
      <Ticks />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          margin: 'auto',
          height: '8px',
          borderRadius: theme.shape.borderRadius,
        }}
        style={{
          left: `${relativeStart * 100}%`,
          width: `${relativeDuration * 100}%`,
          backgroundColor: span.resource.color,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '8px',
          color: theme.palette.grey[700],
          fontSize: '.7rem',
        }}
        style={{
          left: `${(relativeStart + relativeDuration) * 100}%`,
        }}
      >
        {formatTime(spanDuration)}
      </Box>
    </Box>
  );
}
