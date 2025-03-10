// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useRef } from 'react';
import { LinkProps } from '../../../link/interfaces';
import InternalLink from '../../../link/internal';
import { RecoveryLinkProps } from '../../../select/utils/use-select';

import InternalStatusIndicator from '../../../status-indicator/internal';
import { NonCancelableEventHandler, fireNonCancelableEvent } from '../../events';
import { usePrevious } from '../../hooks/use-previous';

import { DropdownStatusProps } from './interfaces';
import styles from './styles.css.js';

export { DropdownStatusProps };

export interface DropdownStatusPropsExtended extends DropdownStatusProps {
  isEmpty?: boolean;
  isNoMatch?: boolean;
  noMatch?: React.ReactNode;
  /**
   * Called when the user clicks the recovery button placed at the
   * bottom of the dropdown list in the error state. Use this to
   * retry a failed request or provide another option for the user
   * to recover from the error.
   */
  onRecoveryClick?: NonCancelableEventHandler;
  recoveryProps?: RecoveryLinkProps;
}

function DropdownStatus({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root} aria-live="polite">
      {children}
    </div>
  );
}

type UseDropdownStatus = ({
  statusType,
  empty,
  loadingText,
  finishedText,
  errorText,
  recoveryText,
  isEmpty,
  isNoMatch,
  noMatch,
  onRecoveryClick,
  recoveryProps,
}: DropdownStatusPropsExtended) => DropdownStatusResult;

interface DropdownStatusResult {
  isSticky: boolean;
  content: React.ReactNode | null;
  focusRecoveryLink: () => void;
}

export const useDropdownStatus: UseDropdownStatus = ({
  statusType,
  empty,
  loadingText,
  finishedText,
  errorText,
  recoveryText,
  isEmpty,
  isNoMatch,
  noMatch,
  onRecoveryClick,
}) => {
  const linkRef = useRef<LinkProps.Ref | null>(null);
  const focusRecoveryLink = () => linkRef.current?.focus();
  const previousStatusType = usePrevious(statusType);
  const statusResult: DropdownStatusResult = { isSticky: true, content: null, focusRecoveryLink };

  if (statusType === 'loading') {
    statusResult.content = <InternalStatusIndicator type={'loading'}>{loadingText}</InternalStatusIndicator>;
  } else if (statusType === 'error') {
    statusResult.content = (
      <span>
        <InternalStatusIndicator type="error" __animate={previousStatusType !== 'error'}>
          {errorText}
        </InternalStatusIndicator>{' '}
        {recoveryText && (
          <InternalLink
            ref={linkRef}
            onFollow={() => fireNonCancelableEvent(onRecoveryClick)}
            variant="recovery"
            className={styles.recovery}
          >
            {recoveryText}
          </InternalLink>
        )}
      </span>
    );
  } else if (isEmpty && empty) {
    statusResult.content = empty;
  } else if (isNoMatch && noMatch) {
    statusResult.content = noMatch;
  } else if (statusType === 'finished' && finishedText) {
    statusResult.content = finishedText;
    statusResult.isSticky = false;
  }

  return statusResult;
};

export default DropdownStatus;
