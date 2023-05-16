import {
	checkCommaInValue,
	getTagToken,
} from 'container/QueryBuilder/filters/QueryBuilderSearch/utils';
import { Option } from 'container/QueryBuilder/type';
import { transformStringWithPrefix } from 'lib/query/transformStringWithPrefix';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BaseAutocompleteData } from 'types/api/queryBuilder/queryAutocompleteResponse';

import { useOperators } from './useOperators';

export const useOptions = (
	key: string,
	keys: BaseAutocompleteData[],
	operator: string,
	searchValue: string,
	isMulti: boolean,
	isValidOperator: boolean,
	isExist: boolean,
	results: string[],
	result: string[],
): Option[] => {
	const [options, setOptions] = useState<Option[]>([]);
	const operators = useOperators(key, keys);

	const getLabel = useCallback(
		(data: BaseAutocompleteData): Option['label'] =>
			transformStringWithPrefix({
				str: data?.key,
				prefix: data?.type || '',
				condition: !data?.isColumn,
			}),
		[],
	);

	const getOptionsFromKeys = useCallback(
		(items: BaseAutocompleteData[]): Option[] =>
			items?.map((item) => ({
				label: `${getLabel(item)}`,
				value: item.key,
			})),
		[getLabel],
	);

	const getKeyOpValue = useCallback(
		(items: string[]): Option[] =>
			items?.map((item) => ({
				label: `${key} ${operator} ${item}`,
				value: `${key} ${operator} ${item}`,
			})),
		[key, operator],
	);

	useEffect(() => {
		if (!key) {
			setOptions(
				searchValue
					? [
							{ label: `${searchValue} `, value: `${searchValue} ` },
							...getOptionsFromKeys(keys),
					  ]
					: getOptionsFromKeys(keys),
			);
		} else if (key && !operator) {
			setOptions(
				operators?.map((operator) => ({
					value: `${key} ${operator} `,
					label: `${key} ${operator} `,
				})),
			);
		} else if (key && operator) {
			if (isMulti) {
				setOptions(
					results.map((item) => ({
						label: checkCommaInValue(String(item)),
						value: String(item),
					})),
				);
			} else if (isExist) {
				setOptions([]);
			} else if (isValidOperator) {
				const hasAllResults = results.every((value) => result.includes(value));
				const values = getKeyOpValue(results);
				const options = hasAllResults
					? [{ label: searchValue, value: searchValue }]
					: [{ label: searchValue, value: searchValue }, ...values];
				setOptions(options);
			}
		}
	}, [
		getKeyOpValue,
		getOptionsFromKeys,
		isExist,
		isMulti,
		isValidOperator,
		key,
		keys,
		operator,
		operators,
		result,
		results,
		searchValue,
	]);

	return useMemo(
		() =>
			(
				options.filter(
					(option, index, self) =>
						index ===
							self.findIndex(
								(o) => o.label === option.label && o.value === option.value, // to remove duplicate & empty options from list
							) && option.value !== '',
				) || []
			).map((option) => {
				const { tagValue } = getTagToken(searchValue);
				if (isMulti) {
					return {
						...option,
						selected: tagValue
							.filter((i) => i.trim().replace(/^\s+/, '') === option.value)
							.includes(option.value),
					};
				}
				return option;
			}),
		[isMulti, options, searchValue],
	);
};