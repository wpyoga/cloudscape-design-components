// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @cloudscape-design/prefer-live-region */

import clsx from 'clsx';
import React, { memo, useEffect, useRef } from 'react';
import ScreenreaderOnly, { ScreenreaderOnlyProps } from '../screenreader-only/index.js';
import styles from './styles.css.js';

export interface LiveRegionProps extends ScreenreaderOnlyProps {
  assertive?: boolean;
  delay?: number;
  visible?: boolean;
  children: React.ReactNode;
}

/**
  The live region is hidden in the layout, but visible for screen readers.
  It's purpose it to announce changes e.g. when custom navigation logic is used.

  The way live region works differently in different browsers and screen readers and
  it is recommended to manually test every new implementation.

  If you notice there are different words being merged together,
  check if there are text nodes not being wrapped in elements, like:
  <LiveRegion>
    {title}
    <span><Details /></span>
  </LiveRegion>

  To fix, wrap "title" in an element:
  <LiveRegion>
    <span>{title}</span>
    <span><Details /></span>
  </LiveRegion>

  Or create a single text node if possible:
  <LiveRegion>
    {`${title} ${details}`}
  </LiveRegion>

  The live region is always atomic, because non-atomic regions can be treated by screen readers
  differently and produce unexpected results. To imitate non-atomic announcements simply use
  multiple live regions:
  <>
    <LiveRegion>{title}</LiveRegion>
    <LiveRegion><Details /></LiveRegion>
  </>
*/
export default memo(LiveRegion);

function LiveRegion({ assertive = false, delay = 10, visible = false, children, ...restProps }: LiveRegionProps) {
  const sourceRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);

  /*
    When React state changes, React often produces too many DOM updates, causing NVDA to
    issue many announcements for the same logical event (See https://github.com/nvaccess/nvda/issues/7996).

    The code below imitates a debouncing, scheduling a callback every time new React state
    update is detected. When a callback resolves, it copies content from a muted element
    to the live region, which is recognized by screen readers as an update.

    If the use case requires no announcement to be ignored, use delay = 0, but ensure it
    does not impact the performance. If it does, prefer using a string as children prop.
  */
  useEffect(() => {
    function updateLiveRegion() {
      if (targetRef.current && sourceRef.current) {
        const sourceContent = extractInnerText(sourceRef.current);
        const targetContent = extractInnerText(targetRef.current);
        if (targetContent !== sourceContent) {
          // The aria-atomic does not work properly in Voice Over, causing
          // certain parts of the content to be ignored. To fix that,
          // we assign the source text content as a single node.
          targetRef.current.innerText = sourceContent;
        }
      }
    }

    let timeoutId: null | number;
    if (delay) {
      timeoutId = setTimeout(updateLiveRegion, delay);
    } else {
      updateLiveRegion();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });

  return (
    <>
      {visible && <span ref={sourceRef}>{children}</span>}

      <ScreenreaderOnly {...restProps} className={clsx(styles.root, restProps.className)}>
        {!visible && (
          <span ref={sourceRef} aria-hidden="true">
            {children}
          </span>
        )}

        <span ref={targetRef} aria-atomic="true" aria-live={assertive ? 'assertive' : 'polite'}></span>
      </ScreenreaderOnly>
    </>
  );
}

// This only extracts text content from the node including all its children which is enough for now.
// To make it more powerful, it is possible to create a more sophisticated extractor with respect to
// ARIA properties to ignore aria-hidden nodes and read ARIA labels from the live content.
function extractInnerText(node: HTMLElement) {
  return (node.innerText || '').replace(/\s+/g, ' ').trim();
}
