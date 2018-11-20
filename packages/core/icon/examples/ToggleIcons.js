// @flow
import React, { Fragment, Component, type ComponentType } from 'react';
import { colors } from '@atlaskit/theme';
import Button from '@atlaskit/button';
import components from '../utils/icons';

const twoColorIcons = ['checkbox', 'radio'];

const toggleableIcons: Array<[string, ComponentType<any>]> = Object.keys(
  components,
)
  .filter(key => twoColorIcons.indexOf(key) !== -1)
  .map(key => [key, components[key].component]);

const styles = {
  iconChecked: {
    color: colors.N400,
    fill: colors.N0,
  },
  iconUnchecked: {
    color: colors.N400,
    fill: colors.N400,
  },
  iconReverse: {
    color: colors.R300,
    fill: colors.B300,
  },
};

type State = {
  toggleColor: boolean,
  toggleFill: boolean,
  icons: any,
};

export default class ToggleIcons extends Component<{}, State> {
  state = {
    toggleColor: false,
    toggleFill: false,
    icons: toggleableIcons,
  };

  render() {
    const colorStyle = this.state.toggleColor
      ? styles.iconChecked
      : styles.iconUnchecked;
    const colorStyleReverse = this.state.toggleFill
      ? styles.iconReverse
      : styles.iconChecked;
    return (
      <div>
        <h6 style={{ padding: 0, margin: '10px 5px' }}>
          Click on these icons wrapped into a button to see them &#39;check&#39;
          and &#39;uncheck&#39; itselves
        </h6>

        <div style={colorStyle}>
          {this.state.icons.map(([id, Icon]) => (
            <Fragment>
              <Button
                onClick={() =>
                  this.setState({ toggleColor: !this.state.toggleColor })
                }
              >
                <Icon
                  key={id}
                  label="Icon which checks and unchecks itself"
                  secondaryColor="inherit"
                />
              </Button>
            </Fragment>
          ))}
        </div>
        <h6 style={{ padding: 0, margin: '10px 5px' }}>
          Click on these icons wrapped into a button to see them
          &#39;reverse&#39; itself while staying &#39;checked&#39;
        </h6>
        <div style={styles.iconReverse}>
          {this.state.icons.map(([id, Icon]) => (
            <Fragment key={id}>
              <Button
                onClick={() =>
                  this.setState({ toggleFill: !this.state.toggleFill })
                }
              >
                <Icon
                  key={id}
                  label="Icon which checks and unchecks itself"
                  primaryColor={
                    this.state.toggleFill
                      ? colorStyleReverse.fill
                      : colorStyleReverse.color
                  }
                />
              </Button>
            </Fragment>
          ))}
        </div>
      </div>
    );
  }
}
