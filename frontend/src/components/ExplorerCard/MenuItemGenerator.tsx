import { DeleteOutlined } from '@ant-design/icons';
import { Col, Row, Typography } from 'antd';
import { useQueryBuilder } from 'hooks/queryBuilder/useQueryBuilder';
import { useDeleteView } from 'hooks/saveViews/useDeleteView';
import { useHandleExplorerTabChange } from 'hooks/useHandleExplorerTabChange';
import { useNotifications } from 'hooks/useNotifications';
import { MouseEvent, useCallback } from 'react';

import { MenuItemContainer } from './styles';
import { MenuItemLabelGeneratorProps } from './types';
import { deleteViewHandler, getViewDetailsUsingViewKey } from './utils';

function MenuItemGenerator({
	viewName,
	viewKey,
	createdBy,
	uuid,
	viewData,
	refetchAllView,
}: MenuItemLabelGeneratorProps): JSX.Element {
	const { panelType, redirectWithQueryBuilderData } = useQueryBuilder();
	const { handleExplorerTabChange } = useHandleExplorerTabChange();
	const { notifications } = useNotifications();

	const { mutateAsync: deleteViewAsync } = useDeleteView(uuid);

	const onDeleteHandler = (event: MouseEvent<HTMLElement>): void => {
		event.stopPropagation();
		deleteViewHandler({
			deleteViewAsync,
			notifications,
			panelType,
			redirectWithQueryBuilderData,
			refetchAllView,
			viewId: uuid,
			viewKey,
		});
	};

	const onMenuItemSelectHandler = useCallback(
		({ key }: { key: string }): void => {
			const currentViewDetails = getViewDetailsUsingViewKey(key, viewData);
			if (!currentViewDetails) return;
			const {
				query,
				name,
				uuid,
				panelType: currentPanelType,
			} = currentViewDetails;

			handleExplorerTabChange(currentPanelType, {
				query,
				name,
				uuid,
			});
		},
		[viewData, handleExplorerTabChange],
	);

	const onLabelClickHandler = (): void => {
		onMenuItemSelectHandler({
			key: uuid,
		});
	};

	return (
		<MenuItemContainer onClick={onLabelClickHandler}>
			<Row justify="space-between">
				<Col span={22}>
					<Row>
						<Typography.Text strong>{viewName}</Typography.Text>
					</Row>
					<Row>
						<Typography.Text type="secondary">Created by {createdBy}</Typography.Text>
					</Row>
				</Col>
				<Col span={2}>
					<Typography.Link>
						<DeleteOutlined onClick={onDeleteHandler} />
					</Typography.Link>
				</Col>
			</Row>
		</MenuItemContainer>
	);
}

export default MenuItemGenerator;