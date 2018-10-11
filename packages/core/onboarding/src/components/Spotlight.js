// @flow
import React, {
  type ComponentType,
  type ElementType,
  type Element,
  type Node,
} from 'react';
import { layers } from '@atlaskit/theme';
import Portal from '@atlaskit/portal';
import ScrollLock from 'react-scrolllock';
import { Fade } from './Animation';
import Clone from './Clone';
import SpotlightDialog from './SpotlightDialog';
import { SpotlightTransitionConsumer } from './SpotlightTransition';
import { SpotlightConsumer } from './SpotlightManager';
import type { ActionsType } from '../types';

export type Props = {
  /** Buttons to render in the footer */
  actions?: ActionsType,
  /** An optional element rendered beside the footer actions */
  actionsBeforeElement?: Element<*>,
  /** The elements rendered in the modal */
  children?: Node,
  /** Where the dialog should appear, relative to the contents of the children. */
  dialogPlacement?:
    | 'top left'
    | 'top center'
    | 'top right'
    | 'right top'
    | 'right middle'
    | 'right bottom'
    | 'bottom left'
    | 'bottom center'
    | 'bottom right'
    | 'left top'
    | 'left middle'
    | 'left bottom',
  /** The width of the dialog in pixels. Min 160 - Max 600 */
  dialogWidth: number,
  /** Optional element rendered below the body */
  footer?: ElementType,
  /** Optional element rendered above the body */
  header?: ElementType,
  /** Heading text rendered above the body */
  heading?: string,
  /** Path to the the your image */
  image?: string,
  /** Whether or not to display a pulse animation around the spotlighted element */
  pulse: boolean,
  /** The name of the SpotlightTarget */
  target?: string,
  /** The spotlight target node */
  targetNode?: HTMLElement,
  /** The background color of the element being highlighted */
  targetBgColor?: string,
  /** Function to fire when a user clicks on the cloned target */
  targetOnClick?: ({ event: MouseEvent, target?: string }) => void,
  /** The border-radius of the element being highlighted */
  targetRadius?: number,
  /** Alternative element to render than the wrapped target */
  targetReplacement?: ComponentType<*>,
};

class SpotlightWrapper extends React.Component<Props> {
  static defaultProps = {
    dialogWidth: 400,
    pulse: true,
  };
  state = {
    showClone: false,
  };
  componentDidMount() {
    window.addEventListener('scroll', e => {
      this.setState({ showClone: true });
    });
  }

  render() {
    const {
      pulse,
      target,
      targetNode,
      targetBgColor,
      targetOnClick,
      targetRadius,
      targetReplacement,
    } = this.props;
    const { showClone } = this.state;
    return (
      <SpotlightConsumer>
        {getTargetElement => (
          <SpotlightTransitionConsumer>
            {({ isOpen, onExited }) => (
              <React.Fragment>
                <Portal zIndex={layers.spotlight()}>
                  {showClone && (
                    <Clone
                      pulse={pulse}
                      target={target}
                      targetBgColor={targetBgColor}
                      targetNode={targetNode || getTargetElement(target)}
                      targetOnClick={targetOnClick}
                      targetRadius={targetRadius}
                      targetReplacement={targetReplacement}
                    />
                  )}
                  <Fade in={isOpen} onExited={onExited}>
                    {animationStyles => (
                      <SpotlightDialog
                        {...this.props}
                        isOpen={isOpen}
                        animationStyles={animationStyles}
                        targetNode={targetNode || getTargetElement(target)}
                      />
                    )}
                  </Fade>
                </Portal>
              </React.Fragment>
            )}
          </SpotlightTransitionConsumer>
        )}
      </SpotlightConsumer>
    );
  }
}

export default SpotlightWrapper;
