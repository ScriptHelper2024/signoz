import { TableProps } from 'antd';
import { GlobalShortcuts } from 'constants/shortcuts/globalShortcuts';
import { LogsExplorerShortcuts } from 'constants/shortcuts/logsExplorerShortcuts';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ALL_SHORTCUTS: Record<string, Record<string, string>> = {
	'Global Shortcuts': GlobalShortcuts,
	'Logs Explorer Shortcuts': LogsExplorerShortcuts,
};

export const shortcutColumns = [
	{
		title: 'Keyboard Shortcut',
		dataIndex: 'shortcutKey',
		key: 'shortcutKey',
		width: '30%',
	},
	{
		title: 'Description',
		dataIndex: 'shortcutDescription',
		key: 'shortcutDescription',
	},
];

interface ShortcutRow {
	shortcutKey: string;
	shortcutDescription: string;
}

export function generateTableData(
	shortcuts: Record<string, string>,
): TableProps<ShortcutRow>['dataSource'] {
	return Object.keys(shortcuts).map((shortcutName) => ({
		key: `${shortcuts[shortcutName]} ${shortcutName}`,
		shortcutKey: shortcuts[shortcutName],
		shortcutDescription: shortcutName,
	}));
}
