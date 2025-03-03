// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import clsx from 'clsx';
import React from 'react';
import { useDynamicOverlap } from '../app-layout/visual-refresh/hooks/use-dynamic-overlap.js';
import styles from './styles.css.js';

interface WizardFormHeaderProps {
  children: React.ReactNode;
  isMobile: boolean;
  isVisualRefresh: boolean;
}

export default function WizardFormHeader({ children, isVisualRefresh }: WizardFormHeaderProps) {
  const overlapElement = useDynamicOverlap();

  return (
    <div
      className={clsx(
        styles['form-header'],
        isVisualRefresh && styles['form-header-refresh'],
        isVisualRefresh && 'awsui-context-content-header'
      )}
      ref={overlapElement}
    >
      <div className={clsx(styles['form-header-content'])}>{children}</div>
    </div>
  );
}
