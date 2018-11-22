// @flow

import React, { PureComponent, type Node } from 'react';
import Container from './styledContainer';
import Content from './styledContent';
import {
  Theme,
  type ThemeAppearance,
  type ThemeProps,
  type ThemeTokens,
} from '../theme';

type Props = {
  /** The appearance type. */
  appearance: ThemeAppearance,

  /** Elements to be rendered inside the lozenge. This should ideally be just a word or two. */
  children?: Node,

  /** Determines whether to apply the bold style or not. */
  isBold: boolean,

  /** max-width of lozenge container. Default to 200px. */
  maxWidth: number | string,

  /** The theme the component should use. */
  theme?: (ThemeTokens, ThemeProps) => ThemeTokens,
};

export default class Lozenge extends PureComponent<Props> {
  static defaultProps = {
    isBold: false,
    appearance: 'default',
    maxWidth: 200,
  };

  render() {
    const { props } = this;
    return (
      <Theme.Consumer props={props} theme={props.theme}>
        {theme => {
          return (
            <Container {...theme}>
              <Content {...theme}>{props.children}</Content>
            </Container>
          );
        }}
      </Theme.Consumer>
    );
  }
}
