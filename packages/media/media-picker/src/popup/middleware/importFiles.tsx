import * as uuid from 'uuid/v4';
import { Store, Dispatch, Middleware } from 'redux';

import { State, SelectedItem, LocalUpload } from '../domain';

import { isStartImportAction } from '../actions/startImport';
import { finalizeUpload } from '../actions/finalizeUpload';
import { remoteUploadStart } from '../actions/remoteUploadStart';
import { getPreview } from '../actions/getPreview';
import { handleCloudFetchingEvent } from '../actions/handleCloudFetchingEvent';
import { setEventProxy } from '../actions/setEventProxy';
import { hidePopup } from '../actions/hidePopup';

import { RECENTS_COLLECTION } from '../config';

import { WsProvider } from '../tools/websocket/wsProvider';
import { WsConnectionHolder } from '../tools/websocket/wsConnectionHolder';
import { RemoteUploadActivity } from '../tools/websocket/upload/remoteUploadActivity';
import { MediaFile, copyMediaFileForUpload } from '../../domain/file';
import { PopupUploadEventEmitter } from '../../components/popup';
import { sendUploadEvent } from '../actions/sendUploadEvent';
import { setUpfrontIdDeferred } from '../actions/setUpfrontIdDeferred';
import { WsNotifyMetadata } from '../tools/websocket/wsMessageData';

import { getPreviewFromMetadata } from '../../domain/preview';
import { TouchFileDescriptor } from '@atlaskit/media-store';
export interface RemoteFileItem extends SelectedItem {
  accountId: string;
  publicId: string;
}

export const isRemoteFileItem = (
  item: SelectedItem,
): item is RemoteFileItem => {
  return ['dropbox', 'google', 'giphy'].indexOf(item.serviceName) !== -1;
};

export const isRemoteService = (serviceName: string) => {
  return ['dropbox', 'google', 'giphy'].indexOf(serviceName) !== -1;
};

type SelectedUploadFile = {
  readonly file: MediaFile;
  readonly serviceName: string;
  readonly touchFileDescriptor: TouchFileDescriptor;
  readonly accountId?: string;
};

const mapSelectedItemToSelectedUploadFile = (
  {
    id,
    name,
    mimeType,
    size,
    date,
    serviceName,
    accountId,
    upfrontId,
    occurrenceKey = uuid(),
  }: SelectedItem,
  collection?: string,
): SelectedUploadFile => ({
  file: {
    id,
    name,
    size,
    creationDate: date || Date.now(),
    type: mimeType,
    upfrontId,
    occurrenceKey,
  },
  serviceName,
  accountId,
  touchFileDescriptor: {
    fileId: uuid(),
    occurrenceKey,
    collection,
  },
});

export function importFilesMiddleware(
  eventEmitter: PopupUploadEventEmitter,
  wsProvider: WsProvider,
): Middleware {
  return store => (next: Dispatch<State>) => action => {
    if (isStartImportAction(action)) {
      importFiles(eventEmitter, store as any, wsProvider);
    }
    return next(action);
  };
}

export async function importFiles(
  eventEmitter: PopupUploadEventEmitter,
  store: Store<State>,
  wsProvider: WsProvider,
): Promise<void> {
  const {
    uploads,
    selectedItems,
    userContext,
    tenantContext,
    config,
  } = store.getState();
  const tenantCollection =
    config.uploadParams && config.uploadParams.collection;
  store.dispatch(hidePopup());

  const auth = await userContext.config.authProvider();
  const selectedUploadFiles = selectedItems.map(item =>
    mapSelectedItemToSelectedUploadFile(item, tenantCollection),
  );
  const touchFileDescriptors = selectedUploadFiles
    .filter(file => file.serviceName !== 'upload')
    .map(file => file.touchFileDescriptor);
  if (touchFileDescriptors.length) {
    tenantContext.file.touchFiles(touchFileDescriptors, tenantCollection);
  }
  eventEmitter.emitUploadsStart(
    selectedUploadFiles.map(({ file, touchFileDescriptor }) =>
      copyMediaFileForUpload(file, touchFileDescriptor.fileId),
    ),
  );

  selectedUploadFiles.forEach(selectedUploadFile => {
    const { file, serviceName, touchFileDescriptor } = selectedUploadFile;
    const selectedItemId = file.id;
    if (serviceName === 'upload') {
      const localUpload: LocalUpload = uploads[selectedItemId];
      const replaceFileId = file.upfrontId;

      importFilesFromLocalUpload(
        selectedItemId,
        touchFileDescriptor.fileId,
        store,
        localUpload,
        replaceFileId,
      );
    } else if (serviceName === 'recent_files') {
      importFilesFromRecentFiles(selectedUploadFile, store);
    } else if (isRemoteService(serviceName)) {
      const wsConnectionHolder = wsProvider.getWsConnectionHolder(auth);

      importFilesFromRemoteService(
        selectedUploadFile,
        store,
        wsConnectionHolder,
      );
    }
  });
}

export const importFilesFromLocalUpload = (
  selectedItemId: string,
  uploadId: string,
  store: Store<State>,
  localUpload: LocalUpload,
  replaceFileId?: Promise<string>,
): void => {
  localUpload.events.forEach(originalEvent => {
    const event = { ...originalEvent };

    if (event.name === 'upload-processing') {
      const { file } = event.data;
      const source = {
        id: file.publicId,
        collection: RECENTS_COLLECTION,
      };

      store.dispatch(finalizeUpload(file, uploadId, source, replaceFileId));
    } else if (event.name !== 'upload-end') {
      store.dispatch(sendUploadEvent({ event, uploadId }));
    }
  });

  store.dispatch(setEventProxy(selectedItemId, uploadId));
};

export const importFilesFromRecentFiles = (
  selectedUploadFile: SelectedUploadFile,
  store: Store<State>,
): void => {
  const { file, touchFileDescriptor } = selectedUploadFile;
  const source = {
    id: file.id,
    collection: RECENTS_COLLECTION,
  };

  store.dispatch(
    finalizeUpload(
      file,
      touchFileDescriptor.fileId,
      source,
      touchFileDescriptor.fileId,
    ),
  );
  store.dispatch(
    getPreview(touchFileDescriptor.fileId, file, RECENTS_COLLECTION),
  );
};

export const importFilesFromRemoteService = (
  selectedUploadFile: SelectedUploadFile,
  store: Store<State>,
  wsConnectionHolder: WsConnectionHolder,
): void => {
  const {
    touchFileDescriptor,
    serviceName,
    accountId,
    file,
  } = selectedUploadFile;
  const { deferredIdUpfronts } = store.getState();
  const deferred = deferredIdUpfronts[file.id];

  if (deferred) {
    const { rejecter, resolver } = deferred;
    // We asociate the temporary file.id with the uploadId
    store.dispatch(
      setUpfrontIdDeferred(touchFileDescriptor.fileId, resolver, rejecter),
    );
  }
  const uploadActivity = new RemoteUploadActivity(
    touchFileDescriptor.fileId,
    (event, payload) => {
      if (event === 'NotifyMetadata') {
        const preview = getPreviewFromMetadata(
          (payload as WsNotifyMetadata).metadata,
        );

        // TODO [MS-1011]: store preview url in context cache
        store.dispatch(
          sendUploadEvent({
            event: {
              name: 'upload-preview-update',
              data: {
                file,
                preview,
              },
            },
            uploadId: touchFileDescriptor.fileId,
          }),
        );
      } else {
        // TODO figure out the difference between this uploadId and the last MSW-405
        const { uploadId: newUploadId } = payload;
        const newFile: MediaFile = {
          ...file,
          id: newUploadId,
          creationDate: Date.now(),
        };

        store.dispatch(handleCloudFetchingEvent(newFile, event, payload));
      }
    },
  );

  uploadActivity.on('Started', () => {
    store.dispatch(remoteUploadStart(touchFileDescriptor.fileId));
  });

  wsConnectionHolder.openConnection(uploadActivity);

  wsConnectionHolder.send({
    type: 'fetchFile',
    params: {
      serviceName,
      accountId,
      fileId: file.id,
      fileName: file.name,
      collection: RECENTS_COLLECTION,
      jobId: touchFileDescriptor.fileId,
    },
  });
};
