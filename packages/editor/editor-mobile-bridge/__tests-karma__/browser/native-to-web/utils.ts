import mobileEditor from '../../../src/editor/mobile-editor-element';
import { mount } from 'enzyme';
import {
  storyMediaProviderFactory,
  sleep,
} from '@atlaskit/editor-test-helpers';

export async function mountEditor() {
  const elem = document.createElement('div');
  elem.setAttribute('id', 'editor');
  const place = document.body.appendChild(elem);
  const mediaProvider = storyMediaProviderFactory({});
  await mediaProvider;
  const wrapper = mount(mobileEditor({ mediaProvider: mediaProvider }), {
    attachTo: place,
  });

  const editor = wrapper.find('EditorWithState');
  await (editor.props() as any).media.provider;

  await sleep(100);
  return wrapper;
}
