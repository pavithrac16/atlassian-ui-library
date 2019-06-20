import * as React from 'react';
import { MouseEvent, KeyboardEvent } from 'react';

import { CardWithUrlContentProps } from './types';
import { uiCardClickedEvent } from '../../utils/analytics';
import { isSpecialKey } from '../../utils';
import { getDefinitionId, getServices } from '../../state/actions/helpers';
import { BlockCard } from '../BlockCard';
import { InlineCard } from '../InlineCard';
import { useSmartLink } from '../../state';

export function CardWithUrlContent({
  url,
  isSelected,
  onClick,
  appearance,
  dispatchAnalytics,
}: CardWithUrlContentProps) {
  // Get state, actions for this card.
  const { state, actions } = useSmartLink(url, dispatchAnalytics);
  const services = getServices(state.details);
  // Setup UI handlers.
  const handleClick = (event: MouseEvent | KeyboardEvent) => {
    isSpecialKey(event)
      ? window.open(url, '_blank')
      : window.open(url, '_self');
  };
  const handleAnalytics = () => {
    const definitionId = getDefinitionId(state.details);
    if (state.status === 'resolved') {
      dispatchAnalytics(uiCardClickedEvent(appearance, definitionId));
    }
  };
  const handleClickWrapper = (event: MouseEvent | KeyboardEvent) => {
    handleAnalytics();
    (onClick && onClick(event)) || handleClick(event);
  };
  const handleAuthorize = () => actions.authorize(appearance);
  // Lazily render into the viewport.
  return appearance === 'inline' ? (
    <InlineCard
      url={url}
      cardState={state}
      handleAuthorize={(services.length && handleAuthorize) || undefined}
      handleFrameClick={handleClickWrapper}
      isSelected={isSelected}
    />
  ) : (
    <BlockCard
      url={url}
      cardState={state}
      handleAuthorize={(services.length && handleAuthorize) || undefined}
      handleErrorRetry={actions.reload}
      handleFrameClick={handleClickWrapper}
      isSelected={isSelected}
    />
  );
}
