import { Button, Tabs, Typography } from 'antd';
import TextToolTip from 'components/TextToolTip';
import { PANEL_TYPES } from 'constants/queryBuilder';
import {
	listViewInitialLogQuery,
	listViewInitialTraceQuery,
} from 'container/NewDashboard/ComponentsSlider/constants';
import { WidgetGraphProps } from 'container/NewWidget/types';
import { QueryBuilder } from 'container/QueryBuilder';
import { QueryBuilderProps } from 'container/QueryBuilder/QueryBuilder.interfaces';
import { useGetWidgetQueryRange } from 'hooks/queryBuilder/useGetWidgetQueryRange';
import { useQueryBuilder } from 'hooks/queryBuilder/useQueryBuilder';
import { useShareBuilderUrl } from 'hooks/queryBuilder/useShareBuilderUrl';
import { updateStepInterval } from 'hooks/queryBuilder/useStepInterval';
import useUrlQuery from 'hooks/useUrlQuery';
import { useDashboard } from 'providers/Dashboard/Dashboard';
import {
	getNextWidgets,
	getPreviousWidgets,
	getSelectedWidgetIndex,
} from 'providers/Dashboard/util';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'store/reducers';
import { Widgets } from 'types/api/dashboard/getAll';
import { Query } from 'types/api/queryBuilder/queryBuilderData';
import { EQueryType } from 'types/common/dashboard';
import { DataSource } from 'types/common/queryBuilder';
import AppReducer from 'types/reducer/app';
import { GlobalReducer } from 'types/reducer/globalTime';

import ClickHouseQueryContainer from './QueryBuilder/clickHouse';
import PromQLQueryContainer from './QueryBuilder/promQL';

function QuerySection({
	selectedGraph,
	selectedTime,
}: QueryProps): JSX.Element {
	const { currentQuery, redirectWithQueryBuilderData } = useQueryBuilder();
	const urlQuery = useUrlQuery();

	const { minTime, maxTime } = useSelector<AppState, GlobalReducer>(
		(state) => state.globalTime,
	);

	const { featureResponse } = useSelector<AppState, AppReducer>(
		(state) => state.app,
	);

	const { selectedDashboard, setSelectedDashboard } = useDashboard();

	const getWidgetQueryRange = useGetWidgetQueryRange({
		graphType: selectedGraph,
		selectedTime: selectedTime.enum,
	});

	const { widgets } = selectedDashboard?.data || {};

	const getWidget = useCallback(() => {
		const widgetId = urlQuery.get('widgetId');
		return widgets?.find((e) => e.id === widgetId);
	}, [widgets, urlQuery]);

	const selectedWidget = getWidget() as Widgets;

	const { query } = selectedWidget;

	useShareBuilderUrl(query);

	const handleStageQuery = useCallback(
		(query: Query): void => {
			if (selectedDashboard === undefined) {
				return;
			}

			const updatedQuery = updateStepInterval(query, maxTime, minTime);

			const selectedWidgetIndex = getSelectedWidgetIndex(
				selectedDashboard,
				selectedWidget.id,
			);

			const previousWidgets = getPreviousWidgets(
				selectedDashboard,
				selectedWidgetIndex,
			);

			const nextWidgets = getNextWidgets(selectedDashboard, selectedWidgetIndex);

			setSelectedDashboard({
				...selectedDashboard,
				data: {
					...selectedDashboard?.data,
					widgets: [
						...previousWidgets,
						{
							...selectedWidget,
							query: updatedQuery,
						},
						...nextWidgets,
					],
				},
			});

			console.log({ updatedQuery });
			console.log({ selectedWidget });

			redirectWithQueryBuilderData(updatedQuery);
		},
		[
			selectedDashboard,
			maxTime,
			minTime,
			selectedWidget,
			setSelectedDashboard,
			redirectWithQueryBuilderData,
		],
	);

	const handleQueryCategoryChange = (qCategory: string): void => {
		const currentQueryType = qCategory;
		console.log({ currentQueryType });

		if (selectedGraph === PANEL_TYPES.LIST) {
			if (currentQueryType === DataSource.LOGS) {
				handleStageQuery(listViewInitialLogQuery);
			} else {
				handleStageQuery(listViewInitialTraceQuery);
			}
			return;
		}

		featureResponse.refetch().then(() => {
			handleStageQuery({
				...currentQuery,
				queryType: currentQueryType as EQueryType,
			});
		});
	};

	const handleRunQuery = (): void => {
		handleStageQuery(currentQuery);
	};

	const filterConfigs: QueryBuilderProps['filterConfigs'] = useMemo(() => {
		const config: QueryBuilderProps['filterConfigs'] = {
			stepInterval: { isHidden: false, isDisabled: true },
		};

		return config;
	}, []);

	const listViewLogFilterConfigs: QueryBuilderProps['filterConfigs'] = useMemo(() => {
		const config: QueryBuilderProps['filterConfigs'] = {
			stepInterval: { isHidden: true, isDisabled: true },
			having: { isHidden: true, isDisabled: true },
		};

		return config;
	}, []);

	const listViewTracesFilterConfigs: QueryBuilderProps['filterConfigs'] = useMemo(() => {
		const config: QueryBuilderProps['filterConfigs'] = {
			stepInterval: { isHidden: true, isDisabled: true },
			having: { isHidden: true, isDisabled: true },
			limit: { isHidden: true, isDisabled: true },
		};

		return config;
	}, []);

	const listItems = [
		{
			key: DataSource.LOGS,
			label: 'Logs',
			tab: <Typography>Log</Typography>,
			children: (
				<QueryBuilder
					panelType={PANEL_TYPES.LIST}
					filterConfigs={listViewLogFilterConfigs}
					isDashboardPanel
					config={{
						initialDataSource: DataSource.LOGS,
						queryVariant: 'static',
					}}
				/>
			),
		},
		{
			key: DataSource.TRACES,
			label: 'Traces',
			tab: <Typography>Traces</Typography>,
			children: (
				<QueryBuilder
					panelType={PANEL_TYPES.LIST}
					filterConfigs={listViewTracesFilterConfigs}
					isDashboardPanel
					config={{
						initialDataSource: DataSource.TRACES,
						queryVariant: 'static',
					}}
				/>
			),
		},
	];

	const items = [
		{
			key: EQueryType.QUERY_BUILDER,
			label: 'Query Builder',
			tab: <Typography>Query Builder</Typography>,
			children: (
				<QueryBuilder panelType={selectedGraph} filterConfigs={filterConfigs} />
			),
		},
		{
			key: EQueryType.CLICKHOUSE,
			label: 'ClickHouse Query',
			tab: <Typography>ClickHouse Query</Typography>,
			children: <ClickHouseQueryContainer />,
		},
		{
			key: EQueryType.PROM,
			label: 'PromQL',
			tab: <Typography>PromQL</Typography>,
			children: <PromQLQueryContainer />,
		},
	];

	console.log({ activeKey: currentQuery.builder.queryData[0].dataSource });
	console.log({ currentQuery });

	return (
		<Tabs
			type="card"
			style={{ width: '100%' }}
			defaultActiveKey={
				selectedGraph !== PANEL_TYPES.EMPTY_WIDGET
					? currentQuery.queryType
					: currentQuery.builder.queryData[0].dataSource
			}
			activeKey={
				selectedGraph !== PANEL_TYPES.LIST
					? currentQuery.queryType
					: currentQuery.builder.queryData[0].dataSource
			}
			onChange={handleQueryCategoryChange}
			tabBarExtraContent={
				<span style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
					<TextToolTip text="This will temporarily save the current query and graph state. This will persist across tab change" />
					<Button
						loading={getWidgetQueryRange.isFetching}
						type="primary"
						onClick={handleRunQuery}
					>
						Stage & Run Query
					</Button>
				</span>
			}
			items={selectedGraph === PANEL_TYPES.LIST ? listItems : items}
		/>
	);
}

interface QueryProps {
	selectedGraph: PANEL_TYPES;
	selectedTime: WidgetGraphProps['selectedTime'];
}

export default QuerySection;
