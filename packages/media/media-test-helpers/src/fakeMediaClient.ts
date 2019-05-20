import { of } from 'rxjs/observable/of';

import { MediaApiConfig, MediaClientConfig } from '@atlaskit/media-core';
import { MediaClient, MediaStore } from '@atlaskit/media-client';

import { asMock } from './jestHelpers';

export const getDefaultMediaClientConfig = (): MediaClientConfig => ({
  authProvider: jest.fn().mockReturnValue(() =>
    Promise.resolve({
      clientId: 'some-client-id',
      token: 'some-token',
      baseUrl: 'some-service-host',
    }),
  ),
});

export const fakeMediaClient = (
  config: MediaClientConfig = getDefaultMediaClientConfig(),
): MediaClient => {
  if (jest && jest.genMockFromModule) {
    const {
      MediaClient: MockMediaClient,
      FileFetcherImpl,
      CollectionFetcher,
    } = jest.genMockFromModule('@atlaskit/media-client');
    const mediaClient = new MockMediaClient();

    const fileFetcher = new FileFetcherImpl();
    const collectionFetcher = new CollectionFetcher();
    const mockMediaStore = new MediaStore({
      authProvider: config.authProvider,
    } as MediaApiConfig);
    mediaClient.file = fileFetcher;
    mediaClient.collection = collectionFetcher;
    mediaClient.config = config;
    mediaClient.config = config;
    mediaClient.mediaStore = mockMediaStore;

    asMock(mediaClient.getImageUrl).mockResolvedValue('some-image-url');
    asMock(mediaClient.getImage).mockImplementation(mockMediaStore.getImage);
    asMock(mediaClient.collection.getItems).mockReturnValue(of([]));
    return mediaClient;
  } else {
    return new MediaClient(config);
  }
};
