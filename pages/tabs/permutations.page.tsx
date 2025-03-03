// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from 'react';
import ScreenshotArea from '../utils/screenshot-area';
import Tabs, { TabsProps } from '~components/tabs';
import createPermutations from '../utils/permutations';
import PermutationsView from '../utils/permutations-view';

const permutations = createPermutations<TabsProps>([
  {
    activeTabId: ['first', 'second'],
    variant: ['default', 'container'],
    tabs: [
      [
        { label: 'First tab', id: 'first', content: 'First content', href: '#first' },
        { label: 'Second tab', id: 'second', href: '#second' },
      ],
      [
        {
          label: 'First tab',
          id: 'first',
          content: (
            <p>
              Long text, long enough to wrap. Shoulder tail brisket sausage, shank biltong pork fatback chicken
              hamburger doner andouille ham hock. Picanha meatball leberkas, turkey andouille boudin tongue frankfurter.
              Fatback tenderloin brisket cow leberkas. Ball tip short loin brisket andouille. Flank turkey drumstick
              cow, prosciutto hamburger bresaola pork.
            </p>
          ),
        },
        { label: 'Second tab', id: 'second', disabled: true },
        {
          label: 'Third tab',
          id: 'third',
          content: "Third tab's content",
        },
      ],
    ],
  },
  {
    variant: ['default', 'container'],
    tabs: [
      ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eight'].map(id => ({
        label: `${id} tab`,
        id,
        content: `${id} content`,
        href: `#${id}`,
      })),
    ],
    disableContentPaddings: [false, true],
  },
]);

export default function TabsPermutations() {
  return (
    <>
      <h1>Tabs permutations</h1>
      <ScreenshotArea disableAnimations={true}>
        <PermutationsView
          permutations={permutations}
          render={permutation => <Tabs {...permutation} activeTabId={permutation.activeTabId} />}
        />
      </ScreenshotArea>
    </>
  );
}
