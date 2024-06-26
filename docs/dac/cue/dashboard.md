# Dashboard builder

The Dashboard builder helps creating dashboards in the format expected by Perses.

## Usage

```cue
package myDaC

import (
	dashboardBuilder "github.com/perses/perses/cue/dac-utils/dashboard"
)

dashboardBuilder & {} // input parameters expected
```

## Parameters

| Parameter      | Type                                                                                                                                                     | Description                                                                                                         |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| `#name`        | string                                                                                                                                                   | The name of the dashboard.                                                                                          |
| `#display`     | [Display](../../api/dashboard.md#display-specification)                                                                                                  | Display object to tune the display name and description.                                                            |
| `#project`     | string                                                                                                                                                   | The project to which the dashboard belongs.                                                                         |
| `#variables`   | [...[VariableSpec](../../api/variable.md#dashboard-level)]                                                                                               | An array of variables defined for the dashboard.                                                                    |
| `#panelGroups` | map[string]: { layout: [Layout](../../api/dashboard.md#layout-specification), panels: map[string]: [Panel](../../api/dashboard.md#panel-specification) } | A map where each key is a panel group name, and the value is an object containing layout and panels for that group. |

## Example

```cue
package myDaC

import (
	dashboardBuilder "github.com/perses/perses/cue/dac-utils/dashboard"
	panelGroupsBuilder "github.com/perses/perses/cue/dac-utils/panelgroups"
	panelBuilder "github.com/perses/perses/cue/dac-utils/prometheus/panel"
	varGroupBuilder "github.com/perses/perses/cue/dac-utils/variable/group"
	textVarBuilder "github.com/perses/perses/cue/dac-utils/variable/text"
	labelValuesVarBuilder "github.com/perses/perses/cue/dac-utils/prometheus/variable/labelvalues"
	timeseriesChart "github.com/perses/perses/cue/schemas/panels/time-series:model"
	promQuery "github.com/perses/perses/cue/schemas/queries/prometheus:model"
)

dashboardBuilder & {
	#name:    "ContainersMonitoring"
	#project: "MyProject"
	#variables: {varGroupBuilder & {
		#input: [
			textVarBuilder & {
				#name:     "prometheus"
				#value:    "platform"
				#constant: true
			},
			labelValuesVarBuilder & {
				#name: "stack"
				#display: name: "PaaS"
				#metric:         "thanos_build_info"
				#label:          "stack"
				#datasourceName: "promDemo"
			}
		]
	}}.variables
	#panelGroups: panelGroupsBuilder & {
		#input: [
			{
				#title: "Resource usage"
				#cols:  3
				#panels: [
					panelBuilder & {
						spec: {
							display: name: "Container CPU"
							plugin: timeseriesChart
							queries: [
								{
									kind: "TimeSeriesQuery"
									spec: plugin: promQuery & {
										spec: query: "sum by (container) (container_cpu_usage_seconds)"
									}
								},
							]
						}
					}
				]
			},
		]
	}
}
```

As you can see, other builders are used in conjunction with the dashboard builder to facilitate further the coding.
Please refer to their respective documentation for more information about each.
