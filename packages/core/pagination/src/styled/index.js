// @flow
import styled from 'styled-components';
import Button from '@atlaskit/button';

export const Container = styled.div`
  display: flex;
  margin-top: 24px;
`;

export const Ellipsis = styled.span`
  display: flex;
  padding: 0 10px;
  text-align: center;
  align-items: center;
`;

/**
 * We need this to style the button with Icon, else it is not properly vertically aligned
 * with rest of the buttons
 */
export const StyledButton = styled(Button)`
  padding: 4px 0;
`;
