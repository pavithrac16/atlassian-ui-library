import * as React from 'react';
import { Component } from 'react';
import {
  Context,
  FileDetails,
  isPreviewableType,
  MediaItemType,
} from '@atlaskit/media-core';
import { AnalyticsContext } from '@atlaskit/analytics-next';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import { UIAnalyticsEventInterface } from '@atlaskit/analytics-next-types';
import { Subscription } from 'rxjs/Subscription';
import { IntlProvider } from 'react-intl';
import {
  MediaViewer,
  MediaViewerItem,
  MediaViewerDataSource,
} from '@atlaskit/media-viewer';
import {
  CardAnalyticsContext,
  CardAction,
  CardDimensions,
  CardProps,
  CardState,
  CardEvent,
} from '../..';
import { Identifier, FileIdentifier } from '../domain';
import { CardView } from '../cardView';
import { LazyContent } from '../../utils/lazyContent';
import { getBaseAnalyticsContext } from '../../utils/analyticsUtils';
import { getDataURIDimension } from '../../utils/getDataURIDimension';
import { getDataURIFromFileState } from '../../utils/getDataURIFromFileState';
import { extendMetadata } from '../../utils/metadata';
import {
  isFileIdentifier,
  isExternalImageIdentifier,
  isDifferentIdentifier,
} from '../../utils/identifier';
import { isBigger } from '../../utils/dimensionComparer';
import { getCardStatus } from './getCardStatus';
import { InlinePlayer } from '../inlinePlayer';

export class Card extends Component<CardProps, CardState> {
  private hasBeenMounted: boolean = false;
  private onClickPayload?: {
    result: CardEvent;
    analyticsEvent?: UIAnalyticsEventInterface;
  };

  subscription?: Subscription;
  static defaultProps: Partial<CardProps> = {
    appearance: 'auto',
    resizeMode: 'crop',
    isLazy: true,
    disableOverlay: false,
  };

  state: CardState = {
    status: 'loading',
    isCardVisible: !this.props.isLazy,
    previewOrientation: 1,
    isPlayingFile: false,
  };

  componentDidMount() {
    const { identifier, context } = this.props;
    this.hasBeenMounted = true;
    this.subscribe(identifier, context);
  }

  componentWillReceiveProps(nextProps: CardProps) {
    const {
      context: currentContext,
      identifier: currentIdentifier,
      dimensions: currentDimensions,
    } = this.props;
    const {
      context: nextContext,
      identifier: nextIdenfifier,
      dimensions: nextDimensions,
    } = nextProps;
    const isDifferent = isDifferentIdentifier(
      currentIdentifier,
      nextIdenfifier,
    );

    if (
      currentContext !== nextContext ||
      isDifferent ||
      this.shouldRefetchImage(currentDimensions, nextDimensions)
    ) {
      this.subscribe(nextIdenfifier, nextContext);
    }
  }

  shouldRefetchImage = (current?: CardDimensions, next?: CardDimensions) => {
    if (!current || !next) {
      return false;
    }
    return isBigger(current, next);
  };

  componentWillUnmount() {
    this.hasBeenMounted = false;
    this.unsubscribe();
    this.releaseDataURI();
  }

  releaseDataURI = () => {
    const { dataURI } = this.state;
    if (dataURI) {
      URL.revokeObjectURL(dataURI);
    }
  };

  private onLoadingChangeCallback = () => {
    const { onLoadingChange } = this.props;
    if (onLoadingChange) {
      const { status, error, metadata } = this.state;
      const state = {
        type: status,
        payload: error || metadata,
      };
      onLoadingChange(state);
    }
  };

  async subscribe(identifier: Identifier, context: Context) {
    const { isCardVisible } = this.state;
    if (!isCardVisible) {
      return;
    }

    if (identifier.mediaItemType === 'external-image') {
      const { dataURI, name } = identifier;

      this.setState({
        status: 'complete',
        dataURI,
        metadata: {
          id: dataURI,
          name: name || dataURI,
          mediaType: 'image',
        },
      });

      return;
    }

    const { id, collectionName, occurrenceKey } = identifier;
    const resolvedId = await id;
    this.unsubscribe();
    this.subscription = context.file
      .getFileState(resolvedId, { collectionName, occurrenceKey })
      .subscribe({
        next: async fileState => {
          let currentDataURI = this.state.dataURI;
          const { metadata: currentMetadata } = this.state;
          const metadata = extendMetadata(
            fileState,
            currentMetadata as FileDetails,
          );

          if (!currentDataURI) {
            const {
              src,
              orientation: previewOrientation,
            } = await getDataURIFromFileState(fileState);
            currentDataURI = src;
            this.notifyStateChange({
              dataURI: currentDataURI,
              previewOrientation,
            });
          }

          switch (fileState.status) {
            case 'uploading':
              const { progress } = fileState;
              this.notifyStateChange({
                status: 'uploading',
                progress,
                metadata,
              });
              break;
            case 'processing':
              if (currentDataURI) {
                this.notifyStateChange({
                  progress: 1,
                  status: 'complete',
                  metadata,
                });
              } else {
                this.notifyStateChange({
                  status: 'processing',
                  metadata,
                });
              }
              break;
            case 'processed':
              if (
                !currentDataURI &&
                metadata.mediaType &&
                isPreviewableType(metadata.mediaType)
              ) {
                const { appearance, dimensions, resizeMode } = this.props;
                const options = {
                  appearance,
                  dimensions,
                  component: this,
                };
                const width = getDataURIDimension('width', options);
                const height = getDataURIDimension('height', options);
                try {
                  const mode =
                    resizeMode === 'stretchy-fit' ? 'full-fit' : resizeMode;
                  const blob = await context.getImage(resolvedId, {
                    collection: collectionName,
                    mode,
                    height,
                    width,
                    allowAnimated: true,
                  });
                  const dataURI = URL.createObjectURL(blob);
                  this.releaseDataURI();
                  if (this.hasBeenMounted) {
                    this.setState({ dataURI });
                  }
                } catch (e) {
                  // We don't want to set status=error if the preview fails, we still want to display the metadata
                }
              }
              this.notifyStateChange({ status: 'complete', metadata });
              break;
            case 'failed-processing':
              this.notifyStateChange({ status: 'failed-processing', metadata });
              break;
            case 'error':
              this.notifyStateChange({ status: 'error' });
          }
        },
        error: error => {
          this.notifyStateChange({ error, status: 'error' });
        },
      });
  }

  notifyStateChange = (state: Partial<CardState>) => {
    if (this.hasBeenMounted) {
      this.setState(
        state as Pick<CardState, keyof CardState>,
        this.onLoadingChangeCallback,
      );
    }
  };

  unsubscribe = () => {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.hasBeenMounted) {
      this.setState({ dataURI: undefined });
    }
  };

  // This method is called when card fails and user press 'Retry'
  private onRetry = () => {
    const { identifier, context } = this.props;

    this.subscribe(identifier, context);
  };

  get analyticsContext(): CardAnalyticsContext {
    const { identifier } = this.props;
    const id = isExternalImageIdentifier(identifier)
      ? 'external-image'
      : identifier.id;

    return getBaseAnalyticsContext('Card', id);
  }

  get actions(): CardAction[] {
    const { actions = [], identifier } = this.props;
    const { status, metadata } = this.state;
    if (isFileIdentifier(identifier) && status === 'failed-processing') {
      actions.unshift({
        label: 'Download',
        icon: <DownloadIcon label="Download" />,
        handler: async () =>
          this.props.context.file.downloadBinary(
            await identifier.id,
            (metadata as FileDetails).name,
            identifier.collectionName,
          ),
      });
    }

    return actions;
  }

  onClick = async (
    result: CardEvent,
    analyticsEvent?: UIAnalyticsEventInterface,
  ) => {
    const {
      identifier,
      onClick,
      useInlinePlayer,
      shouldOpenMediaViewer,
    } = this.props;
    const { mediaItemDetails } = result;

    this.onClickPayload = {
      result,
      analyticsEvent,
    };

    if (onClick) {
      onClick(result, analyticsEvent);
    }

    if (!mediaItemDetails) {
      return;
    }

    const { mediaType } = mediaItemDetails as FileDetails;
    if (useInlinePlayer && mediaType === 'video') {
      this.setState({
        isPlayingFile: true,
      });
    } else if (shouldOpenMediaViewer && identifier.mediaItemType === 'file') {
      const mediaViewerSelectedItem: MediaViewerItem = {
        id: await identifier.id,
        occurrenceKey: '',
        type: 'file',
      };
      this.setState({
        mediaViewerSelectedItem,
      });
    }
  };

  onInlinePlayerError = () => {
    this.setState({
      isPlayingFile: false,
    });
  };

  onInlinePlayerClick = () => {
    const { onClick } = this.props;
    if (onClick && this.onClickPayload) {
      onClick(this.onClickPayload.result, this.onClickPayload.analyticsEvent);
    }
  };

  renderInlinePlayer = () => {
    const { identifier, context, dimensions, selected } = this.props;

    return (
      <InlinePlayer
        context={context}
        dimensions={dimensions}
        identifier={identifier as FileIdentifier}
        onError={this.onInlinePlayerError}
        onClick={this.onInlinePlayerClick}
        selected={selected}
      />
    );
  };

  onMediaViewerClose = () => {
    this.setState({
      mediaViewerSelectedItem: undefined,
    });
  };

  getMediaViewerList = (): MediaViewerItem[] => {
    const { surroundingItems = [] } = this.props;
    const { mediaViewerSelectedItem } = this.state;
    if (!mediaViewerSelectedItem) {
      return [];
    }

    const list: MediaViewerItem[] = surroundingItems.map(id => ({
      id,
      occurrenceKey: '',
      type: 'file' as MediaItemType,
    }));

    return surroundingItems.indexOf(mediaViewerSelectedItem.id) > -1
      ? list
      : [mediaViewerSelectedItem, ...list];
  };

  renderMediaViewer = () => {
    const { mediaViewerSelectedItem } = this.state;
    const { context, identifier } = this.props;
    if (!mediaViewerSelectedItem || identifier.mediaItemType !== 'file') {
      return;
    }

    const { collectionName = '' } = identifier;
    const list = this.getMediaViewerList();
    const dataSource: MediaViewerDataSource = {
      collectionName,
      list,
    };

    return (
      <MediaViewer
        collectionName={collectionName}
        dataSource={dataSource}
        context={context}
        selectedItem={mediaViewerSelectedItem}
        onClose={this.onMediaViewerClose}
      />
    );
  };

  renderCard = () => {
    const {
      isLazy,
      appearance,
      resizeMode,
      dimensions,
      selectable,
      selected,
      onMouseEnter,
      onSelectChange,
      disableOverlay,
      identifier,
    } = this.props;
    const { progress, metadata, dataURI, previewOrientation } = this.state;
    const { analyticsContext, onRetry, onClick, actions } = this;
    const status = getCardStatus(this.state, this.props);
    const card = (
      <AnalyticsContext data={analyticsContext}>
        <CardView
          status={status}
          metadata={metadata}
          dataURI={dataURI}
          mediaItemType={identifier.mediaItemType}
          appearance={appearance}
          resizeMode={resizeMode}
          dimensions={dimensions}
          actions={actions}
          selectable={selectable}
          selected={selected}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onSelectChange={onSelectChange}
          disableOverlay={disableOverlay}
          progress={progress}
          onRetry={onRetry}
          previewOrientation={previewOrientation}
        />
      </AnalyticsContext>
    );

    return isLazy ? (
      <LazyContent placeholder={card} onRender={this.onCardInViewport}>
        {card}
      </LazyContent>
    ) : (
      card
    );
  };

  render() {
    const { isPlayingFile, mediaViewerSelectedItem } = this.state;
    const content = isPlayingFile
      ? this.renderInlinePlayer()
      : this.renderCard();

    // TODO: use Fragment for wrapper
    return this.context.intl ? (
      content
    ) : (
      <IntlProvider locale="en">
        <>
          {content}
          {mediaViewerSelectedItem && this.renderMediaViewer()}
        </>
      </IntlProvider>
    );
  }

  onCardInViewport = () => {
    this.setState({ isCardVisible: true }, () => {
      const { identifier, context } = this.props;
      this.subscribe(identifier, context);
    });
  };
}
