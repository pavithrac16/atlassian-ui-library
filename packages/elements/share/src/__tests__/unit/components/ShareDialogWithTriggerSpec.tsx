import InlineDialog from '@atlaskit/inline-dialog';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { ShareButton } from '../../../components/ShareButton';
import { defaultShareContentState, Props, ShareDialogWithTrigger, State } from '../../../components/ShareDialogWithTrigger';
import { ShareForm } from '../../../components/ShareForm';
import { createMockEvent } from '../_testUtils';

let wrapper: ShallowWrapper<Props, State, ShareDialogWithTrigger>;
let mockOnShareSubmit: jest.Mock;
const mockLoadOptions = () => [];

beforeEach(() => {
  wrapper = shallow<ShareDialogWithTrigger>(
    <ShareDialogWithTrigger
      copyLink="copyLink"
      loadUserOptions={mockLoadOptions}
      onShareSubmit={mockOnShareSubmit}
    />,
  );
});

beforeAll(() => {
  mockOnShareSubmit = jest.fn();
});

describe('ShareDialogWithTrigger', () => {
  describe('default', () => {
    it('should render', () => {
      expect(wrapper.find(InlineDialog).length).toBe(1);
      expect(wrapper.find(InlineDialog).prop('isOpen')).toBe(false);
      expect(wrapper.find(ShareForm).length).toBe(0);
      expect(wrapper.find(ShareButton).length).toBe(1);
    });
  });

  describe('isDialogOpen state', () => {
    it('should be false by default', () => {
      expect(wrapper.state().isDialogOpen).toBe(false);
    });

    it('should be passed into isOpen prop InlineDialog and isSelected props in ShareButton', () => {
      let { isDialogOpen } = wrapper.state();
      expect(isDialogOpen).toEqual(false);
      expect(wrapper.find(InlineDialog).prop('isOpen')).toEqual(isDialogOpen);
      expect(wrapper.find(ShareButton).prop('isSelected')).toEqual(
        isDialogOpen,
      );

      (wrapper as any).setState({ isDialogOpen: !isDialogOpen });

      expect(wrapper.find(InlineDialog).prop('isOpen')).toEqual(!isDialogOpen);
      expect(wrapper.find(ShareButton).prop('isSelected')).toEqual(
        !isDialogOpen,
      );
    });

    it('should render ShareForm if isDialogOpen is true', () => {
      const wrapper = mount<ShareDialogWithTrigger>(
        <ShareDialogWithTrigger
          copyLink="copyLink"
          loadUserOptions={mockLoadOptions}
          onShareSubmit={mockOnShareSubmit}
        />,
      );
      wrapper.setState({ isDialogOpen: true });
      expect(wrapper.find(ShareForm).length).toBe(1);
    });
  });

  describe('children prop', () => {
    it('should render a ShareButton if children prop is not given', () => {
      expect(wrapper.find(ShareButton).length).toBe(1);
    });

    it('should be called with the this.handleOpenDialog function as argument if given', () => {
      const spiedRenderer = jest.fn();
      wrapper = shallow<ShareDialogWithTrigger>(
        <ShareDialogWithTrigger
          copyLink="copyLink"
          loadUserOptions={mockLoadOptions}
          onShareSubmit={mockOnShareSubmit}
        >
          {spiedRenderer}
        </ShareDialogWithTrigger>,
      );
      const wrapperState = wrapper.state();
      expect(spiedRenderer).toHaveBeenCalledTimes(1);
      expect(spiedRenderer).toHaveBeenCalledWith(
        expect.objectContaining({
          onClick: expect.any(Function),
          loading: wrapperState.isSharing,
          error: wrapperState.shareError,
        }),
      );
    });
  });

  describe('isDisabled prop', () => {
    it('should be passed into ShareButton', () => {
      let isDisabled = false;
      wrapper = shallow<ShareDialogWithTrigger>(
        <ShareDialogWithTrigger
          copyLink="copyLink"
          isDisabled={isDisabled}
          loadUserOptions={mockLoadOptions}
          onShareSubmit={mockOnShareSubmit}
        />,
      );
      let shareButtonProps = wrapper.find(ShareButton).props();
      expect(shareButtonProps.isDisabled).toEqual(isDisabled);

      wrapper.setProps({ isDisabled: !isDisabled });

      shareButtonProps = wrapper.find(ShareButton).props();
      expect(shareButtonProps.isDisabled).toEqual(!isDisabled);
    });
  });

  describe('handleOpenDialog', () => {
    it('should set the isDialogOpen state to true', () => {
      expect(wrapper.state().isDialogOpen).toEqual(false);
      wrapper.find(ShareButton).simulate('click');
      expect(wrapper.state().isDialogOpen).toEqual(true);
    });

    it.skip('should send an analytic event', () => {});
  });

  describe('handleCloseDialog', () => {
    it('should set the isDialogOpen state to false', () => {
      wrapper = shallow<ShareDialogWithTrigger>(
        <ShareDialogWithTrigger
          copyLink="copyLink"
          loadUserOptions={mockLoadOptions}
          onShareSubmit={mockOnShareSubmit}
        />,
      );
      wrapper.setState({ isDialogOpen: true });
      expect(wrapper.state().isDialogOpen).toEqual(true);
      wrapper
        .find(InlineDialog)
        .simulate('close', { isOpen: false, event: { type: 'submit' } });
      expect(wrapper.state().isDialogOpen).toEqual(false);
    });

    it.skip('should send an analytic event', () => {});

    it('should be trigger when the InlineDialog is closed', () => {
      const escapeKeyDownEvent = {
        target: document,
        type: 'keydown',
        key: 'Escape',
      };

      const wrapper = shallow<ShareDialogWithTrigger>(
        <ShareDialogWithTrigger copyLink="copyLink" />,
      );
      wrapper.setState({ isDialogOpen: true });
      expect(wrapper.state().isDialogOpen).toEqual(true);
      wrapper
        .find(InlineDialog)
        .simulate('close', { isOpen: false, event: escapeKeyDownEvent });
      expect(wrapper.state().isDialogOpen).toEqual(false);
    });
  });

  describe('handleShareSubmit', () => {
    // TODO never ends
    it.skip('should call onSubmit props with an object of users and comment as an argument', () => {
      const mockOnSubmit = jest.fn().mockResolvedValue({});
      const mockState = {
        isDialogOpen: true,
        isSharing: false,
        users: [{ type: 'user' as 'user', id: 'id' }, { email: 'email' }],
        comment: {
          format: 'plain_text' as 'plain_text',
          value: 'comment',
        },
        ignoreIntermediateState: false,
        defaultValue: defaultShareContentState,
      };
      const mockSubmitEvent = createMockEvent('submit', {
        target: document.createElement('form'),
      });
      wrapper = shallow<ShareDialogWithTrigger>(
        <ShareDialogWithTrigger
          copyLink="copyLink"
          onShareSubmit={mockOnSubmit}
          loadUserOptions={mockLoadOptions}
        />,
      );
      wrapper.setState(mockState);
      wrapper.find(ShareForm).simulate('shareClick', mockSubmitEvent);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit.mock.calls[0][0]).toEqual({
        users: mockState.users,
        comment: mockState.comment,
      });
    });

    it('should close inline dialog when onSubmit resolves a value', () => {
      const mockOnSubmit = jest.fn().mockReturnValue(Promise.resolve());
      const wrapper = shallow<ShareDialogWithTrigger>(
        <ShareDialogWithTrigger
          copyLink="copyLink"
          onShareSubmit={mockOnSubmit}
        />,
      );

      const Content: React.StatelessComponent<{}> = () =>
        wrapper.find(InlineDialog).prop('content');
      const content = shallow(<Content />);

      expect(content.find(ShareForm)).toHaveLength(1);
      const shareData = {};
      content.find(ShareForm).simulate('shareClick', shareData);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(shareData);

      expect(wrapper.state('isDialogOpen')).toBeFalsy();
    });
  });
});
