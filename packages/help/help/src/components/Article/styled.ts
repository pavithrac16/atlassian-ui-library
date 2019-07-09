/** @jsx jsx */
import styled from '@emotion/styled';
import { gridSize } from '@atlaskit/theme/constants';
import * as colors from '@atlaskit/theme/colors';

export const ArticleContainer = styled.div`
  position: absolute;
  height: calc(100% - ${13 * gridSize()}px);
  width: 100%;
  background-color: #ffffff;
  top: ${13 * gridSize()}px;
  left: 0;
  flex: 1;
  flex-direction: column;
  padding: ${gridSize() * 2}px ${gridSize() * 3}px ${gridSize() * 2}px
    ${gridSize() * 3}px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
`;

export const SelectedIcon = styled.div`
  margin-top: 0.3em;
`;

export const ArticleContentInner = styled.div`
  padding-bottom: ${2 * gridSize()}px;
  position: relative;
`;

export const ArticleContentTitle = styled.div`
  padding-bottom: ${2 * gridSize()}px;
`;

export const ArticleRateText = styled.div`
  font-size: 0.75rem;
  font-weight: bold;
  color: ${colors.N200};
  line-height: ${gridSize() * 2}px;
  position: relative;
  display: inline-block;
`;

export const ArticleRateAnswerWrapper = styled.div`
  padding-top: ${gridSize() * 2}px;
`;
