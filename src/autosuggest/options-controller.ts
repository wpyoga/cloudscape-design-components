// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState, MutableRefObject } from 'react';
import { filterOptions } from './utils/utils';
import { generateTestIndexes } from '../internal/components/options-list/utils/test-indexes';
import { AutosuggestItem, AutosuggestProps } from './interfaces';
import { createHighlightedOptionHook } from '../internal/components/options-list/utils/use-highlight-option';

type Options = AutosuggestProps.Options;

export interface UseAutosuggestItemsProps {
  options: Options;
  filterValue: string;
  filterText: string;
  filteringType: AutosuggestProps.FilteringType;
  isKeyboard: MutableRefObject<boolean>;
  hideEnteredTextLabel?: boolean;
}

const isHighlightable = (option?: AutosuggestItem) => {
  return !!option && option.type !== 'parent';
};

const useHighlightedOption = createHighlightedOptionHook({ isHighlightable: isHighlightable });

const parentMap = new WeakMap<AutosuggestItem, AutosuggestItem>();
export const getParentGroup = (item: AutosuggestItem) => parentMap.get(item);

export const useAutosuggestItems = ({
  options,
  filterValue,
  filterText,
  filteringType,
  isKeyboard,
  hideEnteredTextLabel,
}: UseAutosuggestItemsProps) => {
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(() => createItems(options), [options]);

  const filteredItems = useMemo(() => {
    const filteredItems = filteringType === 'auto' && !showAll ? filterOptions(items, filterText) : [...items];
    if (filterValue && !hideEnteredTextLabel) {
      filteredItems.unshift({ value: filterValue, type: 'use-entered', option: { value: filterValue } });
    }
    generateTestIndexes(filteredItems, getParentGroup);
    return filteredItems;
  }, [items, filterValue, filterText, filteringType, showAll, hideEnteredTextLabel]);

  const { highlightedOption, highlightedIndex, highlightedType, moveHighlight, resetHighlight, setHighlightedIndex } =
    useHighlightedOption({ options: filteredItems, isKeyboard });

  return {
    showAll,
    setShowAll,
    items: filteredItems,
    highlightedIndex,
    highlightedType,
    highlightedOption,
    setHighlightedIndex,
    moveHighlight,
    resetHighlight,
  };
};

function createItems(options: Options): AutosuggestItem[] {
  const items: AutosuggestItem[] = [];
  for (const option of options) {
    if (isGroup(option)) {
      items.push(...flattenGroup(option));
    } else {
      items.push({ ...option, option });
    }
  }
  return items;
}

function isGroup(optionOrGroup: AutosuggestProps.Option): optionOrGroup is AutosuggestProps.OptionGroup {
  return 'options' in optionOrGroup;
}

function flattenGroup(group: AutosuggestProps.OptionGroup): AutosuggestItem[] {
  const { options, ...rest } = group;
  const hasOnlyDisabledChildren = options.every(option => option.disabled);
  const parent: AutosuggestItem = {
    ...rest,
    type: 'parent',
    disabled: rest.disabled || hasOnlyDisabledChildren,
    option: group,
  };
  const children: AutosuggestItem[] = options.map(option => ({
    ...option,
    type: 'child',
    disabled: option.disabled || parent.disabled,
    option,
  }));
  // TODO: Refactor parentMap and remove this side effect
  children.forEach(child => parentMap.set(child, { ...group, option: group }));
  return [parent].concat(children);
}