import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { publishReplay } from 'rxjs/operators/publishReplay';
import {
  MediaStore,
  UploadableFile,
  UploadController,
  uploadFile,
  MediaFileArtifacts,
} from '@atlaskit/media-store';
import {
  FilePreview,
  FileState,
  GetFileOptions,
  mapMediaFileToFileState,
} from '../fileState';
import { fileStreamsCache } from '../context/fileStreamCache';
import FileStreamCache from '../context/fileStreamCache';
import { getMediaTypeFromUploadableFile } from '../utils/getMediaTypeFromUploadableFile';

const POLLING_INTERVAL = 1000;

export class FileFetcher {
  constructor(private readonly mediaStore: MediaStore) {}

  getFileState(id: string, options?: GetFileOptions): Observable<FileState> {
    const key = FileStreamCache.createKey(id, options);
    const collection = options && options.collectionName;
    const fileState = fileStreamsCache.get(key);

    if (!fileState) {
      const fileStream$ = publishReplay<FileState>(1)(
        this.createDownloadFileStream(id, collection),
      );
      fileStream$.connect();
      fileStreamsCache.set(key, fileStream$);

      return fileStream$;
    }

    const subscribtion = fileState.subscribe({
      next: currentState => {
        if (
          currentState.status === 'processed' ||
          currentState.status === 'error' ||
          currentState.status === 'failed-processing'
        ) {
          setImmediate(() => subscribtion.unsubscribe());
        } else {
          // TODO: we should initiate the polling once, currently it happens everytime we ask for fileState
          const fileStream$ = publishReplay<FileState>(1)(
            this.createDownloadFileStream(id, collection, currentState),
          );
          fileStream$.connect();
          fileStreamsCache.set(key, fileStream$);
          setImmediate(() => subscribtion.unsubscribe());
        }
      },
    });

    return fileState;
  }

  getArtifactURL(
    artifacts: MediaFileArtifacts,
    artifactName: keyof MediaFileArtifacts,
    collectionName?: string,
  ): Promise<string> {
    return this.mediaStore.getArtifactURL(
      artifacts,
      artifactName,
      collectionName,
    );
  }

  private createDownloadFileStream = (
    id: string,
    collection?: string,
    initialState?: FileState,
  ): Observable<FileState> => {
    return Observable.create(async (observer: Observer<FileState>) => {
      let timeoutId: number;

      const fetchFile = async (initialState?: FileState) => {
        try {
          const response = await this.mediaStore.getFile(id, { collection });
          const fileState = mapMediaFileToFileState(response);

          observer.next({
            ...initialState,
            ...fileState,
          });

          if (fileState.status === 'processing') {
            timeoutId = window.setTimeout(
              () => fetchFile(initialState),
              POLLING_INTERVAL,
            );
          } else {
            observer.complete();
          }
        } catch (e) {
          observer.error(e);
        }
      };

      fetchFile(initialState);

      return () => {
        window.clearTimeout(timeoutId);
      };
    });
  };

  upload(
    file: UploadableFile,
    controller?: UploadController,
  ): Observable<FileState> {
    let fileId: string;
    let mimeType = '';
    let preview: FilePreview;
    // TODO [MSW-796]: get file size for base64
    const size = file.content instanceof Blob ? file.content.size : 0;
    const mediaType = getMediaTypeFromUploadableFile(file);
    const collectionName = file.collection;
    const name = file.name || ''; // name property is not available in base64 image
    const subject = new ReplaySubject<FileState>(1);

    if (file.content instanceof Blob) {
      mimeType = file.content.type;
      preview = {
        blob: file.content,
      };
    }
    const { deferredFileId: onUploadFinish, cancel } = uploadFile(
      file,
      this.mediaStore,
      {
        onProgress: progress => {
          if (fileId) {
            subject.next({
              progress,
              name,
              size,
              mediaType,
              mimeType,
              id: fileId,
              status: 'uploading',
              preview,
            });
          }
        },
        onId: (id, occurrenceKey) => {
          fileId = id;
          const key = FileStreamCache.createKey(fileId, { collectionName });
          fileStreamsCache.set(key, subject);
          if (file.content instanceof Blob) {
            subject.next({
              name,
              size,
              mediaType,
              mimeType,
              id: fileId,
              occurrenceKey,
              progress: 0,
              status: 'uploading',
              preview,
            });
          }
        },
      },
    );

    if (controller) {
      controller.setAbort(cancel);
    }

    onUploadFinish
      .then(() => {
        subject.next({
          id: fileId,
          name,
          size,
          mediaType,
          mimeType,
          status: 'processing',
          preview,
        });
        subject.complete();
      })
      .catch(error => {
        // we can't use .catch(subject.error) due that will change the Subscriber context
        subject.error(error);
      });

    return subject;
  }

  async downloadBinary(
    id: string,
    name: string = 'download',
    collectionName?: string,
  ) {
    const isIE11 =
      !!(window as any).MSInputMethodContext &&
      !!(document as any).documentMode;
    const iframeName = 'media-download-iframe';
    const link = document.createElement('a');
    let iframe = document.getElementById(iframeName) as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.id = iframeName;
      iframe.name = iframeName;
      document.body.appendChild(iframe);
    }
    link.href = await this.mediaStore.getFileBinaryURL(id, collectionName);
    link.download = name;
    link.target = isIE11 ? '_blank' : iframeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
