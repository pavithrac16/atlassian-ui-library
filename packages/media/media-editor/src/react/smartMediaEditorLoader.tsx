import * as React from 'react';

import { ModalSpinner } from '@atlaskit/media-ui';
import { colors } from '@atlaskit/theme';
import { WithContextOrMediaClientConfigProps } from '@atlaskit/media-client';
import { SmartMediaEditorProps } from './smartMediaEditor';

type SmartEditorWithMediaClientConfigProps = WithContextOrMediaClientConfigProps<
  SmartMediaEditorProps
>;
type SmartEditorWithMediaClientConfigComponent = React.ComponentType<
  SmartEditorWithMediaClientConfigProps
>;

interface AsyncSmartMediaEditorState {
  SmartMediaEditor?: SmartEditorWithMediaClientConfigComponent;
}

export default class AsyncSmartMediaEditor extends React.PureComponent<
  SmartEditorWithMediaClientConfigProps & AsyncSmartMediaEditorState,
  AsyncSmartMediaEditorState & { isErrored: boolean }
> {
  static displayName = 'AsyncSmartMediaEditor';
  static SmartMediaEditor?: SmartEditorWithMediaClientConfigComponent;

  state = {
    // Set state value to equal to current static value of this class.
    SmartMediaEditor: AsyncSmartMediaEditor.SmartMediaEditor,
    isErrored: false,
  };

  async UNSAFE_componentWillMount() {
    if (!this.state.SmartMediaEditor) {
      try {
        const [mediaClient, smartEditorModule] = await Promise.all([
          import(/* webpackChunkName:"@atlaskit-media-client" */ '@atlaskit/media-client'),
          import(/* webpackChunkName:"@atlaskit-internal_smart-media-editor" */ './smartMediaEditor'),
        ]);
        AsyncSmartMediaEditor.SmartMediaEditor = mediaClient.withMediaClient(
          smartEditorModule.default,
        );
        this.setState({
          SmartMediaEditor: AsyncSmartMediaEditor.SmartMediaEditor,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        this.setState({ isErrored: true });
      }
    }
  }

  render() {
    const { isErrored } = this.state;

    if (isErrored) {
      return null;
    }
    if (!this.state.SmartMediaEditor) {
      return (
        <ModalSpinner blankedColor={colors.N700A} invertSpinnerColor={true} />
      );
    }

    return <this.state.SmartMediaEditor {...this.props} />;
  }
}
