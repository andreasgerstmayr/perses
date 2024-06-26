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

import {
  Avatar,
  Chip,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { ServiceStats, TraceData, TraceSearchResult, formatDuration, msToPrometheusDuration } from '@perses-dev/core';
import { QueryData } from '@perses-dev/plugin-system';
import { MouseEvent, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import InformationIcon from 'mdi-material-ui/Information';
import { getConsistentServiceColor } from '../gantt-chart/GanttChart/utils';

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'long',
  timeStyle: 'medium',
};
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, DATE_FORMAT_OPTIONS).format;

export interface DataTableProps {
  result: Array<QueryData<TraceData>>;
  onTraceClick?: (e: MouseEvent, traceId: string) => void;
  traceLink?: (traceId: string) => string;
}

export function DataTable(props: DataTableProps) {
  const { result, onTraceClick, traceLink } = props;

  if (!result) {
    return null;
  }

  const traces = result.flatMap((d) => d.data).flatMap((d) => d?.searchResult || []);
  const rows = traces.map((trace) => buildRow(trace, onTraceClick, traceLink));

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>
              <Typography>Trace Name</Typography>
            </StyledTableCell>
            <StyledTableCell>
              <Typography>Spans</Typography>
            </StyledTableCell>
            <StyledTableCell>
              <Typography>Duration</Typography>
            </StyledTableCell>
            <StyledTableCell>
              <Typography>Start time</Typography>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </>
  );
}

function buildRow(
  trace: TraceSearchResult,
  onTraceClick?: (e: MouseEvent, traceId: string) => void,
  traceLink?: (traceId: string) => string
): ReactNode {
  let totalSpanCount = 0;
  let totalErrorCount = 0;
  for (const stats of Object.values(trace.serviceStats)) {
    totalSpanCount += stats.spanCount;
    totalErrorCount += stats.errorCount ?? 0;
  }

  return (
    <StyledTableRow key={trace.traceId}>
      <StyledTableCell onClick={(e) => onTraceClick?.(e, trace.traceId)}>
        {buildTraceName(trace, traceLink)}
        {buildServiceStatsChips(trace.serviceStats)}
      </StyledTableCell>
      <StyledTableCell>
        <Typography display="inline">{totalSpanCount} spans</Typography>
        {totalErrorCount > 0 && (
          <Chip
            label={`${totalErrorCount} errors`}
            sx={{ marginLeft: '5px' }}
            icon={<InformationIcon />}
            variant="outlined"
            size="small"
            color="error"
          />
        )}
      </StyledTableCell>
      <StyledTableCell>
        <Typography>
          {trace.durationMs < 1 ? '<1ms' : formatDuration(msToPrometheusDuration(trace.durationMs))}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography>{DATE_FORMATTER(new Date(trace.startTimeUnixMs))}</Typography>
      </StyledTableCell>
    </StyledTableRow>
  );
}

function buildTraceName(trace: TraceSearchResult, traceLink?: (traceId: string) => string) {
  if (traceLink) {
    return (
      <>
        <Link
          variant="body1"
          color="inherit"
          underline="hover"
          component={RouterLink}
          to={traceLink(trace.traceId)}
          reloadDocument
        >
          <strong>{trace.rootServiceName}:</strong> {trace.rootTraceName}
        </Link>
        <br />
      </>
    );
  }

  return (
    <Typography>
      <strong>{trace.rootServiceName}:</strong> {trace.rootTraceName}
    </Typography>
  );
}

function buildServiceStatsChips(serviceStats: Record<string, ServiceStats>) {
  return Object.entries(serviceStats).map(([serviceName, stats]) => (
    <Chip
      key={serviceName}
      label={serviceName}
      sx={{ marginTop: '5px', marginRight: '5px' }}
      variant="outlined"
      size="small"
      avatar={<Avatar sx={{ backgroundColor: getConsistentServiceColor(serviceName) }}>{stats.spanCount}</Avatar>}
    />
  ));
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.grey.A100,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));
