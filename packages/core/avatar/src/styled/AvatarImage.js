// @flow

import React, { type Node } from 'react';
import styled from 'styled-components';
import { colors, Theme } from '@atlaskit/theme';
import { theme } from '../theme';
import type { AppearanceType, SizeType } from '../types';

const themeBackgroundColors = {
  light: colors.N0,
  dark: colors.DN30,
};
const shapeGroupBackgroundColors = {
  light: colors.N50,
  dark: colors.DN100,
};
export const ShapeGroup = styled.g`
  & circle,
  & rect {
    fill: ${props => shapeGroupBackgroundColors[props.mode]};
  }
  & g {
    fill: ${props => themeBackgroundColors[props.mode]};
  }
`;

type SlotProps = {|
  appearance: AppearanceType,
  isLoading: boolean,
  size: SizeType,
  role: string,
  label: ?string,
  backgroundImage: ?string,
|};

export const Slot = ({
  isLoading,
  appearance,
  size,
  backgroundImage,
  label,
  role,
}: SlotProps) => (
  <Theme props={{ appearance, isLoading, size }} theme={theme}>
    {({ backgroundColor, borderRadius }) => (
      <span
        style={{
          backgroundColor,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : null,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          borderRadius,
          display: 'flex',
          flex: '1 1 100%',
          height: '100%',
          width: '100%',
        }}
        role={role}
        aria-label={label}
      />
    )}
  </Theme>
);

type SvgProps = {
  appearance: AppearanceType,
  size: SizeType,
  children: Node,
};

export const Svg = ({
  appearance,
  size,
  children,
  ...otherProps
}: SvgProps) => (
  <Theme props={{ appearance, size, isLoading: false }} theme={theme}>
    {({ backgroundColor, borderRadius }) => (
      <svg
        style={{
          backgroundColor,
          borderRadius,
          height: '100%',
          width: '100%',
        }}
        {...otherProps}
      >
        {children}
      </svg>
    )}
  </Theme>
);
