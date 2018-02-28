// @flow
import React from 'react';
import { shallow } from 'enzyme';

import { CommentAction } from '../src/';
import SubtleLink from '../src/components/SubtleLink';

describe('@atlaskit comments', () => {
  describe('CommentAction', () => {
    it('should pass props down to SubtleLink', () => {
      const props = {
        onClick: jest.fn(),
        onFocus: jest.fn(),
        onMouseOver: jest.fn(),
      };
      const wrapper = shallow(<CommentAction {...props} />);
      Object.keys(props).forEach(propName => {
        expect(wrapper.find(SubtleLink).prop(propName)).toBe(props[propName]);
      });
    });

    it('should render a SubtleLink with comment action context', () => {
      const wrapper = shallow(<CommentAction>Delete</CommentAction>);
      const { analyticsContext } = wrapper.find(SubtleLink).props();
      expect(analyticsContext).toEqual({ component: 'comment-action' });
    });
  });
});
