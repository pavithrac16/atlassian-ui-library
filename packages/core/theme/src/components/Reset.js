// @flow

import React, { type Node } from 'react';
import styled, { css } from 'styled-components';
import * as colors from '../colors';
import { Consumer } from './Context';
import type { ThemeReset } from '../types';

const orTextColor = (preferred: string) => (p: ThemeReset) =>
  p[preferred] || p.textColor;
const Div = styled.div`
  ${p => css`
    background-color: ${p.backgroundColor};
    color: ${p.textColor};

    a {
      color: ${orTextColor('linkColor')};
    }
    a:hover {
      color: ${orTextColor('linkColorHover')};
    }
    a:active {
      color: ${orTextColor('linkColorActive')};
    }
    a:focus {
      outline-color: ${orTextColor('linkColorOutline')};
    }
    h1,
    h2,
    h3,
    h4,
    h5 {
      color: ${orTextColor('headingColor')};
    }
    h6 {
      color: ${orTextColor('subtleHeadingColor')};
    }
    small {
      color: ${orTextColor('subtleTextColor')};
    }
  `};
`;

const defaultTheme: ThemeReset = {
  backgroundColor: colors.N0,
  linkColor: colors.B400,
  linkColorHover: colors.B300,
  linkColorActive: colors.B500,
  linkColorOutline: colors.B100,
  headingColor: colors.N800,
  subtleHeadingColor: colors.N200,
  subtleTextColor: colors.N200,
  textColor: colors.N900,
};

type Props = {
  children?: Node,
};

export default ({ children, ...props }: Props) => (
  <Consumer>
    {theme => (
      <Div {...defaultTheme} {...theme} {...props}>
        {children}
      </Div>
    )}
  </Consumer>
);
