jest.mock('../../utils/getDataURIFromFileState');
import { Observable, ReplaySubject } from 'rxjs';
import * as React from 'react';
import { shallow, mount } from 'enzyme';
import {
  fakeMediaClient,
  nextTick,
  asMockReturnValue,
  asMock,
  expectFunctionToHaveBeenCalledWith,
} from '@atlaskit/media-test-helpers';
import {
  MediaClient,
  FileState,
  FileDetails,
  FileIdentifier,
  ExternalImageIdentifier,
  Identifier,
  globalMediaEventEmitter,
  isFileIdentifier,
  MediaViewedEventPayload,
} from '@atlaskit/media-client';
import { AnalyticsListener, UIAnalyticsEvent } from '@atlaskit/analytics-next';
import { MediaViewer } from '@atlaskit/media-viewer';
import { CardAction, CardProps, CardDimensions } from '../..';
import { Card } from '../../root/card';
import { CardView } from '../../root/cardView';
import { InlinePlayer } from '../../root/inlinePlayer';
import { LazyContent } from '../../utils/lazyContent';
import {
  getDataURIFromFileState,
  FilePreview,
} from '../../utils/getDataURIFromFileState';

describe('Card', () => {
  let identifier: Identifier;
  const fileIdentifier: FileIdentifier = {
    id: 'some-random-id',
    mediaItemType: 'file',
    collectionName: 'some-collection-name',
    occurrenceKey: 'some-occurrence-key',
  };

  const setup = (
    mediaClient: MediaClient = createMediaClientWithGetFile(),
    props?: Partial<CardProps>,
    filePreview: FilePreview = { src: 'some-data-uri', orientation: 6 },
  ) => {
    (getDataURIFromFileState as any).mockReset();
    (getDataURIFromFileState as any).mockReturnValue(filePreview);
    const component = shallow<Card>(
      <Card
        mediaClient={mediaClient}
        identifier={identifier}
        isLazy={false}
        {...props}
      />,
    );

    return {
      component,
      mediaClient,
    };
  };

  const defaultFileState: FileState = {
    status: 'processed',
    id: '123',
    name: 'file-name',
    size: 10,
    artifacts: {},
    mediaType: 'image',
    mimeType: 'image/png',
    representations: { image: {} },
  };

  const createMediaClientWithGetFile = (
    fileState: FileState = defaultFileState,
  ) => {
    const mockMediaClient = fakeMediaClient();

    asMockReturnValue(
      mockMediaClient.file.getFileState,
      Observable.of(fileState),
    );
    return mockMediaClient;
  };

  const emptyPreview: FilePreview = { src: undefined };

  beforeEach(() => {
    identifier = fileIdentifier;
    jest.spyOn(globalMediaEventEmitter, 'emit');
    asMock(getDataURIFromFileState).mockReturnValue({
      src: 'some-data-uri',
      orientation: 6,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    (getDataURIFromFileState as any).mockReset();
  });

  it('should use the new mediaClient to create the subscription when mediaClient prop changes', async () => {
    const firstMediaClient = createMediaClientWithGetFile();
    const secondMediaClient = createMediaClientWithGetFile();
    const { component } = setup(firstMediaClient);
    component.setProps({ mediaClient: secondMediaClient, identifier });

    const { id, collectionName, occurrenceKey } = fileIdentifier;
    await nextTick();
    expect(secondMediaClient.file.getFileState).toHaveBeenCalledTimes(1);
    expect(secondMediaClient.file.getFileState).toBeCalledWith(id, {
      collectionName,
      occurrenceKey,
    });
    expect(component.find(CardView)).toHaveLength(1);
  });

  it('should refetch the image when width changes to a higher value', async () => {
    const initialDimensions: CardDimensions = {
      width: 100,
      height: 200,
    };
    const newDimensions: CardDimensions = {
      ...initialDimensions,
      width: 1000,
    };
    const { component, mediaClient } = setup(
      undefined,
      {
        identifier,
        dimensions: initialDimensions,
      },
      emptyPreview,
    );
    component.setProps({ mediaClient, dimensions: newDimensions });

    await nextTick();
    expect(mediaClient.getImage).toHaveBeenCalledTimes(2);
    expect(mediaClient.getImage).toHaveBeenLastCalledWith('some-random-id', {
      allowAnimated: true,
      collection: 'some-collection-name',
      mode: 'crop',
      width: 1000,
      height: 200,
    });
  });

  it('should refetch the image when height changes to a higher value', async () => {
    const initialDimensions: CardDimensions = {
      width: 100,
      height: 200,
    };
    const newDimensions: CardDimensions = {
      ...initialDimensions,
      height: 2000,
    };
    const { component, mediaClient } = setup(
      undefined,
      {
        identifier,
        dimensions: initialDimensions,
      },
      emptyPreview,
    );
    component.setProps({ mediaClient, dimensions: newDimensions });

    await nextTick();
    expect(mediaClient.getImage).toHaveBeenCalledTimes(2);
    expect(mediaClient.getImage).toHaveBeenLastCalledWith('some-random-id', {
      allowAnimated: true,
      collection: 'some-collection-name',
      mode: 'crop',
      width: 100,
      height: 2000,
    });
  });

  it('should not refetch the image when width changes to a smaller value', async () => {
    const initialDimensions: CardDimensions = {
      width: 100,
      height: 200,
    };
    const newDimensions: CardDimensions = {
      ...initialDimensions,
      width: 10,
    };
    const mediaClient = createMediaClientWithGetFile({
      ...defaultFileState,
      preview: undefined,
    });
    const { component } = setup(
      mediaClient,
      {
        identifier,
        dimensions: initialDimensions,
      },
      emptyPreview,
    );
    component.setProps({ mediaClient, dimensions: newDimensions });

    await nextTick();
    expect(mediaClient.getImage).toHaveBeenCalledTimes(1);
  });

  it('should not refetch the image when height changes to a smaller value', async () => {
    const initialDimensions: CardDimensions = {
      width: 100,
      height: 200,
    };
    const newDimensions: CardDimensions = {
      ...initialDimensions,
      height: 20,
    };
    const { component, mediaClient } = setup(
      undefined,
      {
        identifier,
        dimensions: initialDimensions,
      },
      emptyPreview,
    );
    component.setProps({ mediaClient, dimensions: newDimensions });

    await nextTick();
    expect(mediaClient.getImage).toHaveBeenCalledTimes(1);
  });

  it('should fire onClick when passed in as a prop and CardView fires onClick', () => {
    const mediaClient = fakeMediaClient() as any;
    const clickHandler = jest.fn();
    const card = shallow(
      <Card
        mediaClient={mediaClient}
        identifier={identifier}
        onClick={clickHandler}
      />,
    );
    const cardViewOnClick = card.find(CardView).props().onClick;

    if (!cardViewOnClick) {
      throw new Error('CardView onClick was undefined');
    }

    expect(clickHandler).not.toHaveBeenCalled();
    cardViewOnClick({} as any, {} as any);
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  it('should pass onMouseEnter to CardView', () => {
    const mediaClient = fakeMediaClient() as any;
    const hoverHandler = () => {};
    const card = shallow(
      <Card
        mediaClient={mediaClient}
        identifier={identifier}
        onMouseEnter={hoverHandler}
      />,
    );

    expect(card.find(CardView).props().onMouseEnter).toEqual(hoverHandler);
  });

  it('should use lazy load by default', () => {
    const mediaClient = fakeMediaClient() as any;
    const hoverHandler = () => {};
    const card = shallow(
      <Card
        mediaClient={mediaClient}
        identifier={identifier}
        onMouseEnter={hoverHandler}
      />,
    );
    expect(card.find(LazyContent)).toHaveLength(1);
  });

  it('should not use lazy load when "isLazy" is false', () => {
    const mediaClient = createMediaClientWithGetFile();
    const hoverHandler = () => {};
    const card = shallow(
      <Card
        isLazy={false}
        mediaClient={mediaClient}
        identifier={identifier}
        onMouseEnter={hoverHandler}
      />,
    );

    expect(card.find(LazyContent)).toHaveLength(0);
  });

  it('should pass properties down to CardView', () => {
    const mediaClient = fakeMediaClient() as any;
    const card = shallow(
      <Card
        mediaClient={mediaClient}
        identifier={identifier}
        dimensions={{ width: 100, height: 50 }}
      />,
    );

    expect(card.find(CardView).props().dimensions).toEqual({
      width: 100,
      height: 50,
    });
  });

  it('should create a card placeholder with the right props', () => {
    const mediaClient = createMediaClientWithGetFile();
    const fileCard = shallow(
      <Card
        mediaClient={mediaClient}
        identifier={identifier}
        dimensions={{ width: 100, height: 50 }}
      />,
    );
    const filePlaceholder = fileCard.find(CardView);
    const { status, dimensions } = filePlaceholder.props();

    expect(status).toBe('loading');
    expect(dimensions).toEqual({ width: 100, height: 50 });
  });

  it('should use "crop" as default resizeMode', () => {
    const mediaClient = createMediaClientWithGetFile();
    const card = mount(
      <Card mediaClient={mediaClient} identifier={identifier} isLazy={false} />,
    );

    expect(card.find(CardView).prop('resizeMode')).toBe('crop');
  });

  it('should pass right resizeMode down', () => {
    const mediaClient = createMediaClientWithGetFile();

    const card = mount(
      <Card
        mediaClient={mediaClient}
        identifier={identifier}
        isLazy={false}
        resizeMode="full-fit"
      />,
    );

    expect(card.find(CardView).prop('resizeMode')).toBe('full-fit');
  });

  it('should contain analytics mediaClient with identifier info', () => {
    const analyticsEventHandler = jest.fn();
    const mediaClient = createMediaClientWithGetFile();

    const card = mount(
      <AnalyticsListener channel="media" onEvent={analyticsEventHandler}>
        <Card
          mediaClient={mediaClient}
          identifier={identifier}
          isLazy={false}
          resizeMode="full-fit"
        />
      </AnalyticsListener>,
    );

    card.simulate('click');

    expect(analyticsEventHandler).toHaveBeenCalledTimes(1);
    const actualFiredEvent: UIAnalyticsEvent =
      analyticsEventHandler.mock.calls[0][0];
    expect(actualFiredEvent.context[0]).toEqual(
      expect.objectContaining({
        actionSubject: 'MediaCard',
        actionSubjectId: 'some-random-id',
        componentName: 'Card',
        packageName: '@atlaskit/media-card',
      }),
    );
  });

  it('should pass "disableOverlay" to CardView', () => {
    const mediaClient = fakeMediaClient();
    const card = shallow(
      <Card
        mediaClient={mediaClient}
        identifier={identifier}
        isLazy={false}
        resizeMode="full-fit"
        disableOverlay={true}
      />,
      { disableLifecycleMethods: true },
    );

    expect(card.find(CardView).prop('disableOverlay')).toBe(true);
  });

  it('should use mediaClient.file.getFile to fetch file data', async () => {
    const { mediaClient } = setup();
    await nextTick();
    expect(mediaClient.file.getFileState).toHaveBeenCalledTimes(1);
    expect(mediaClient.file.getFileState).toBeCalledWith('some-random-id', {
      collectionName: 'some-collection-name',
      occurrenceKey: 'some-occurrence-key',
    });
  });

  it('should work with async identifier', async () => {
    const identifier: FileIdentifier = {
      id: Promise.resolve('file-id'),
      mediaItemType: 'file',
      collectionName: 'collection',
      occurrenceKey: 'some-occurrence-key',
    };
    const { mediaClient } = setup(undefined, { identifier });
    await nextTick();
    expect(mediaClient.file.getFileState).toHaveBeenCalledTimes(1);
    expect(mediaClient.file.getFileState).toBeCalledWith('file-id', {
      collectionName: 'collection',
      occurrenceKey: 'some-occurrence-key',
    });
  });

  it('should set dataURI only if its not present', async () => {
    const { component } = setup();
    await nextTick();
    expect(getDataURIFromFileState).toHaveBeenCalledTimes(1);
    expect(component.state('dataURI')).toEqual('some-data-uri');
  });

  it('should set preview orientation and pass it down do view', async () => {
    const { component } = setup();
    await nextTick();

    expect(component.state('previewOrientation')).toEqual(6);
    component.update();
    expect(component.find(CardView).prop('previewOrientation')).toEqual(6);
  });

  it('should set right state when file is uploading', async () => {
    const mediaClient = createMediaClientWithGetFile({
      ...defaultFileState,
      status: 'uploading',
      progress: 0.2,
    });
    const { component } = setup(mediaClient);

    await nextTick();
    expect(component.state()).toEqual({
      status: 'uploading',
      dataURI: 'some-data-uri',
      isCardVisible: true,
      progress: 0.2,
      previewOrientation: 6,
      isPlayingFile: false,
      metadata: {
        id: '123',
        mediaType: 'image',
        mimeType: 'image/png',
        name: 'file-name',
        size: 10,
      },
    });
  });

  it('should set right state when file is processing', async () => {
    const mediaClient = createMediaClientWithGetFile({
      ...defaultFileState,
      progress: 0.5,
      status: 'uploading',
    });
    const { component } = setup(mediaClient);

    await nextTick();
    expect(component.state()).toEqual({
      status: 'uploading',
      dataURI: 'some-data-uri',
      progress: 0.5,
      isCardVisible: true,
      isPlayingFile: false,
      previewOrientation: 6,
      metadata: {
        id: '123',
        mediaType: 'image',
        mimeType: 'image/png',
        name: 'file-name',
        size: 10,
      },
    });
  });

  it('should set right state when file is processed', async () => {
    const { component } = setup(undefined, undefined, {
      src: undefined,
      orientation: 6,
    });

    // we need to wait for 2 promises: fetch metadata + fetch preview
    await nextTick();
    await nextTick();

    expect(component.state()).toEqual({
      status: 'complete',
      dataURI: 'mock result of URL.createObjectURL()',
      progress: undefined,
      isCardVisible: true,
      isPlayingFile: false,
      previewOrientation: 6,
      metadata: {
        id: '123',
        mediaType: 'image',
        name: 'file-name',
        mimeType: 'image/png',
        size: 10,
      },
    });
  });

  it('should render error card when getFileState resolves with status=error', async () => {
    const mediaClient = createMediaClientWithGetFile({
      ...defaultFileState,
      status: 'error',
    });
    const { component } = setup(mediaClient);

    await nextTick();
    component.update();
    expect(component.find(CardView).prop('status')).toEqual('error');
  });

  it('should render failed card when getFileState resolves with status=failed', async () => {
    const mediaClient = createMediaClientWithGetFile({
      ...defaultFileState,
      status: 'failed-processing',
    });
    const { component } = setup(mediaClient);

    await nextTick();
    component.update();
    const { status, metadata } = component.find(CardView).props();
    expect(status).toEqual('failed-processing');
    expect(metadata).toEqual({
      id: '123',
      size: 10,
      name: 'file-name',
      mimeType: 'image/png',
      mediaType: 'image',
    } as FileDetails);
  });

  it('should render error card when getFileState fails', async () => {
    const mediaClient = fakeMediaClient();
    asMockReturnValue(
      mediaClient.file.getFileState,
      new Observable(subscriber => {
        subscriber.error('some-error');
      }),
    );

    const { component } = setup(mediaClient);

    await nextTick();
    expect(component.state('error')).toEqual('some-error');
    component.update();
    expect(component.find(CardView).prop('status')).toEqual('error');
  });

  it('should fetch remote preview when image representation available and there is no local preview', async () => {
    const mediaClient = createMediaClientWithGetFile({
      ...defaultFileState,
      status: 'processing',
      representations: {
        image: {},
      },
    });
    setup(mediaClient, undefined, emptyPreview);

    // we need to wait for 2 promises: fetch metadata + fetch preview
    await nextTick();
    await nextTick();

    expect(mediaClient.getImage).toHaveBeenCalledTimes(1);
    expect(mediaClient.getImage).toBeCalledWith('some-random-id', {
      collection: 'some-collection-name',
      height: 125,
      width: 156,
      allowAnimated: true,
      mode: 'crop',
    });
  });

  it('should not fetch remote preview when there is local preview', async () => {
    const subject = new ReplaySubject<FileState>(1);
    const baseState: FileState = {
      id: '123',
      mediaType: 'image',
      status: 'processing',
      mimeType: 'image/png',
      name: 'file-name',
      size: 10,
      representations: {
        image: {},
      },
    };
    subject.next(baseState);
    const mediaClient = fakeMediaClient();
    asMockReturnValue(mediaClient.file.getFileState, subject);
    const { component } = setup(mediaClient);

    // we need to wait for 2 promises: fetch metadata + fetch preview
    await nextTick();
    await nextTick();

    expect(component.state('dataURI')).toEqual('some-data-uri');
    expect(mediaClient.getImage).toHaveBeenCalledTimes(0);

    subject.next({
      ...baseState,
      status: 'processed',
      artifacts: {} as any,
    });
    asMock(getDataURIFromFileState).mockReturnValue({
      src: 'fooo',
      orientation: 6,
    });

    await nextTick();
    await nextTick();

    // We want to make sure that when transition from "processing" to "processed" we still don't call getImage if we already have preview
    expect(component.state('dataURI')).toEqual('some-data-uri');
    expect(component.state('status')).toEqual('complete');
    expect(mediaClient.getImage).toHaveBeenCalledTimes(0);
  });

  it('should pass resize mode down to getImage call', async () => {
    const { mediaClient } = setup(
      undefined,
      {
        resizeMode: 'full-fit',
      },
      emptyPreview,
    );

    // we need to wait for 2 promises: fetch metadata + fetch preview
    await nextTick();
    await nextTick();

    expect(mediaClient.getImage).toBeCalledWith(
      'some-random-id',
      expect.objectContaining({
        mode: 'full-fit',
      }),
    );
  });

  it('should change mode from stretchy-fit to full-fit while passing down to getImage call', async () => {
    const { mediaClient } = setup(
      undefined,
      {
        resizeMode: 'stretchy-fit',
      },
      emptyPreview,
    );

    // we need to wait for 2 promises: fetch metadata + fetch preview
    await nextTick();
    await nextTick();

    expect(mediaClient.getImage).toBeCalledWith(
      'some-random-id',
      expect.objectContaining({
        mode: 'full-fit',
      }),
    );
  });

  it('should render CardView with expected props', async () => {
    const { component } = setup(
      undefined,
      {
        dimensions: { width: 10, height: 20 },
        selectable: true,
        selected: true,
        resizeMode: 'fit',
        disableOverlay: true,
      },
      emptyPreview,
    );

    // we need to wait for 2 promises: fetch metadata + fetch preview
    await nextTick();
    await nextTick();
    component.update();

    expect(component.find(CardView).props()).toEqual(
      expect.objectContaining({
        appearance: 'auto',
        dataURI: 'mock result of URL.createObjectURL()',
        dimensions: { width: 10, height: 20 },
        disableOverlay: true,
        progress: undefined,
        resizeMode: 'fit',
        selectable: true,
        selected: true,
        status: 'complete',
      }),
    );

    expect(component.find(CardView).prop('metadata')).toEqual({
      id: '123',
      mediaType: 'image',
      name: 'file-name',
      mimeType: 'image/png',
      size: 10,
    });
  });

  it('should cleanup resources when unmounting', () => {
    const unsubscribe = jest.fn();
    const releaseDataURI = jest.fn();
    const { component } = setup();
    const instance = component.instance() as Card;

    instance.unsubscribe = unsubscribe;
    instance.releaseDataURI = releaseDataURI;

    component.unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(releaseDataURI).toHaveBeenCalledTimes(1);
  });

  it('ED-6584: should keep dataURI in the state if it was already generated', async () => {
    const { component, mediaClient } = setup(undefined, {
      dimensions: { width: 50, height: 50 },
    });

    await nextTick();
    component.setProps({ dimensions: { width: 100, height: 100 } });
    const currentDataURI = component.state('dataURI');
    await nextTick();
    const newDataURI = component.state('dataURI');
    expect(mediaClient.file.getFileState).toHaveBeenCalledTimes(2);
    expect(currentDataURI).toEqual(newDataURI);
  });

  it('should keep orientation in the state if it was already acquired', async () => {
    const { component } = setup(undefined, {
      dimensions: { width: 50, height: 50 },
    });

    await nextTick();
    component.setProps({ dimensions: { width: 100, height: 100 } });
    const previewOrientation = component.state('previewOrientation');
    await nextTick();
    const newDataPreviewOrientation = component.state('previewOrientation');
    expect(previewOrientation).toEqual(6);
    expect(newDataPreviewOrientation).toEqual(6);
  });

  describe('Retry', () => {
    it('should pass down "onRetry" prop when an error occurs', async () => {
      const { component, mediaClient } = setup();
      const cardViewOnError = component.find(CardView).prop('onRetry')!;
      await nextTick();
      expect(mediaClient.file.getFileState).toHaveBeenCalledTimes(1);
      cardViewOnError();
      await nextTick();
      expect(mediaClient.file.getFileState).toHaveBeenCalledTimes(2);
    });
  });

  describe('External image identifier', () => {
    it('should work with external image identifier', () => {
      const identifier: ExternalImageIdentifier = {
        mediaItemType: 'external-image',
        dataURI: 'bla',
        name: 'some external image',
      };

      const { component } = setup(undefined, { identifier });

      expect(component.find('CardView').prop('dataURI')).toEqual('bla');
      expect(component.find('CardView').prop('metadata')).toEqual({
        id: 'bla',
        mediaType: 'image',
        name: 'some external image',
      });
    });

    it('should use dataURI as default name', () => {
      const identifier: ExternalImageIdentifier = {
        mediaItemType: 'external-image',
        dataURI: 'bla',
      };

      const { component } = setup(undefined, { identifier });

      expect(component.find('CardView').prop('metadata')).toEqual({
        id: 'bla',
        mediaType: 'image',
        name: 'bla',
      });
    });
  });

  it('should add download Action when in failed-processing state', () => {
    const initialActions: Array<CardAction> = [
      {
        handler: () => {},
      },
    ];
    const { component } = setup(undefined, {
      actions: initialActions,
    });
    component.setState({
      status: 'failed-processing',
      metadata: {
        id: 'some-id',
      },
    });
    component.update();
    const actions = component.find(CardView).prop('actions')!;
    expect(actions).toHaveLength(2);
    expect(actions[0].label).toEqual('Download');
  });

  it('should call item download when download Action is executed', async () => {
    identifier = fileIdentifier;
    const { component, mediaClient } = setup();
    component.setState({
      status: 'failed-processing',
      metadata: {
        id: 'some-id',
        name: 'some-file-name',
      },
    });
    component.update();
    const actions = component.find(CardView).prop('actions')!;
    actions[0].handler();
    await identifier.id;
    expect(mediaClient.file.downloadBinary).toHaveBeenCalledWith(
      identifier.id,
      'some-file-name',
      identifier.collectionName,
    );
  });

  describe('when CardView calls onDisplayImage', () => {
    const expectMediaViewedEvent = async ({
      fileId,
      isUserCollection,
    }: {
      fileId: string;
      isUserCollection: boolean;
    }) => {
      const { component } = setup();
      const { onDisplayImage } = component.find(CardView).props();
      if (!onDisplayImage) {
        return expect(onDisplayImage).toBeDefined();
      }
      onDisplayImage();
      if (isFileIdentifier(identifier)) {
        await identifier.id;
      }
      expect(globalMediaEventEmitter.emit).toHaveBeenCalledTimes(1);
      expectFunctionToHaveBeenCalledWith(globalMediaEventEmitter.emit, [
        'media-viewed',
        {
          fileId,
          isUserCollection,
          viewingLevel: 'minimal',
        } as MediaViewedEventPayload,
      ]);
    };

    it('should trigger "media-viewed" in globalMediaEventEmitter when collection is not recents', async () => {
      identifier = fileIdentifier;
      await expectMediaViewedEvent({
        fileId: 'some-random-id',
        isUserCollection: false,
      });
    });

    it('should trigger "media-viewed" in globalMediaEventEmitter when collection is recents', async () => {
      identifier = {
        ...fileIdentifier,
        collectionName: 'recents',
      };
      await expectMediaViewedEvent({
        fileId: 'some-random-id',
        isUserCollection: true,
      });
    });

    it('should trigger "media-viewed" in globalMediaEventEmitter when external identifier', async () => {
      identifier = {
        mediaItemType: 'external-image',
        dataURI: 'some-data-uri',
      };
      await expectMediaViewedEvent({
        fileId: 'some-data-uri',
        isUserCollection: false,
      });
    });
  });

  describe('Inline player', () => {
    it('should render InlinePlayer when isPlayingFile=true', () => {
      const { component } = setup();

      component.setState({
        isPlayingFile: true,
      });
      component.update();
      expect(component.find(InlinePlayer)).toHaveLength(1);
    });

    it('should set isPlayingFile=true when clicking on a video file', () => {
      const { component } = setup(undefined, { useInlinePlayer: true });
      const instance = component.instance() as Card;

      instance.onClick({
        mediaItemDetails: {
          mediaType: 'video',
        },
      } as any);

      expect(component.state('isPlayingFile')).toBeTruthy();
    });
  });

  describe('MediaViewer integration', () => {
    const clickedIdentifier: any = {
      mediaItemDetails: {
        mediaType: 'file',
      },
    };

    it('should render MV when shouldOpenMediaViewer=true', async () => {
      const { component } = setup(undefined, { shouldOpenMediaViewer: true });
      const instance = component.instance() as Card;

      instance.onClick(clickedIdentifier);
      await nextTick();

      const MV = component.find(MediaViewer);

      expect(component.state('mediaViewerSelectedItem')).toEqual(identifier);
      expect(MV).toHaveLength(1);
      expect(MV.props()).toEqual(
        expect.objectContaining({
          collectionName: 'some-collection-name',
          dataSource: { list: [] },
          selectedItem: identifier,
        }),
      );
    });

    it('should pass dataSource to MV', async () => {
      const { component } = setup(undefined, {
        shouldOpenMediaViewer: true,
        mediaViewerDataSource: { list: [identifier, identifier] },
      });
      const instance = component.instance() as Card;

      instance.onClick(clickedIdentifier);
      await nextTick();
      expect(component.find(MediaViewer).prop('dataSource')).toEqual({
        list: [identifier, identifier],
      });
    });

    it('should not render MV if useInlinePlayer=true and identifier is video type', async () => {
      const videoIdentifier: FileIdentifier = {
        id: '1',
        mediaItemType: 'file',
      };
      const { component } = setup(undefined, {
        useInlinePlayer: true,
        shouldOpenMediaViewer: true,
        identifier: videoIdentifier,
      });
      const instance = component.instance() as Card;

      instance.onClick({
        mediaItemDetails: {
          mediaType: 'video',
        },
      } as any);
      await nextTick();

      expect(component.find(MediaViewer)).toHaveLength(0);
    });
  });
});
