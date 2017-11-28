import * as React from 'react';
import { shallow } from 'enzyme';
import { FileDetails } from '@atlaskit/media-core';

import { FileCard, FileCardImageView } from '../../src/files';
import { CardGenericViewSmall } from '../../src/utils/cardGenericViewSmall';

describe('FileCard', () => {
  it('should render cardFileView with details passed through to props', function() {
    const details: FileDetails = {
      mediaType: 'image',
      mimeType: 'image/jpeg',
      name: 'some-image.jpg',
      processingStatus: 'succeeded',
      size: 123456,
      artifacts: {},
    };

    const expectedProps = {
      status: 'complete',
      dimensions: undefined,

      mediaName: details.name,
      mediaType: details.mediaType,
      mediaSize: details.size,
    };

    const card = shallow(<FileCard status="complete" details={details} />);

    const fileCardView = card.find(FileCardImageView);
    expect(fileCardView.length).toEqual(1);
    expect(fileCardView.props()).toMatchObject(expectedProps);
  });

  it('should render CardGenericViewSmall with file details passed through to props', () => {
    const details: FileDetails = {
      mediaType: 'image',
      mimeType: 'image/jpeg',
      name: 'some-image.jpg',
      processingStatus: 'succeeded',
      size: 123456,
      artifacts: {},
    };

    const expectedProps = {
      title: details.name,
      mediaType: details.mediaType,
      subtitle: '121 KB',
    };

    const card = shallow(
      <FileCard appearance="small" status="complete" details={details} />,
    );

    expect(card.find(CardGenericViewSmall).length).toEqual(1);
    expect(card.find(CardGenericViewSmall).props()).toMatchObject(
      expectedProps,
    );
  });

  it('should render fileCardView with dataUri when passed', () => {
    const fakeDataUri: string = 'l33tdatauri';

    const details: FileDetails = {
      mediaType: 'image',
      mimeType: 'image/jpeg',
      name: 'some-image.jpg',
      processingStatus: 'succeeded',
      size: 123456,
      artifacts: {},
    };

    const card = shallow(
      <FileCard status="complete" details={details} dataURI={fakeDataUri} />,
    );

    expect(card.find(FileCardImageView).length).toEqual(1);
    expect(card.find(FileCardImageView).props().dataURI).toContain(fakeDataUri);
  });

  it('should render CardGenericViewSmall with dataUri when passed', () => {
    const fakeDataUri: string = 'l33tdatauri';

    const details: FileDetails = {
      mediaType: 'image',
      mimeType: 'image/jpeg',
      name: 'some-image.jpg',
      processingStatus: 'succeeded',
      size: 123456,
      artifacts: {},
    };

    const card = shallow(
      <FileCard
        appearance="small"
        status="complete"
        details={details}
        dataURI={fakeDataUri}
      />,
    );

    expect(card.find(CardGenericViewSmall).length).toEqual(1);
    expect(card.find(CardGenericViewSmall).props().thumbnailUrl).toEqual(
      fakeDataUri,
    );
  });

  it('should pass "Failed to load" copy to "small" card view', () => {
    const card = shallow(<FileCard appearance="small" status="error" />);

    expect(card.find(CardGenericViewSmall).props().error).toEqual(
      'Failed to load',
    );
  });

  it('should pass "Failed to load" copy to "image" card view', () => {
    const card = shallow(<FileCard appearance="image" status="error" />);

    expect(card.find(FileCardImageView).props().error).toEqual(
      'Failed to load',
    );
  });
});
