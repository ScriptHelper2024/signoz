import { RouteTabProps } from 'components/RouteTab/types';
import { TFunction } from 'i18next';
import { ROLES, USER_ROLES } from 'types/roles';
import { isCloudUser, isEECloudUser } from 'utils/app';

import {
	alertChannels,
	apiKeys,
	generalSettings,
	generalSettingsCloud,
	ingestionSettings,
	organizationSettings,
} from './config';

export const getRoutes = (
	userRole: ROLES | null,
	isCurrentOrgSettings: boolean,
	t: TFunction,
): RouteTabProps['routes'] => {
	const settings = [];

	if (isCurrentOrgSettings) {
		settings.push(...organizationSettings(t));
	}

	if (isCloudUser()) {
		settings.push(...ingestionSettings(t));
		settings.push(...alertChannels(t));
		settings.push(...generalSettingsCloud(t));
	} else {
		settings.push(...alertChannels(t));
		settings.push(...generalSettings(t));
	}

	if ((isCloudUser() || isEECloudUser()) && userRole === USER_ROLES.ADMIN) {
		settings.push(...apiKeys(t));
	}

	return settings;
};
