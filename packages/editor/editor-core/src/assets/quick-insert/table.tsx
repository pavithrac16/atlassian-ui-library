import * as React from 'react';
import { IconProps } from './index';

export default function icon({ label = '' }: IconProps) {
  return (
    <div
      aria-label={label}
      dangerouslySetInnerHTML={{
        __html: `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="#FFF" d="M0 0h40v40H0z"/><g stroke="#C1C7D0"><path fill="#FFF" d="M20 16h14v8H20z"/><path d="M20 8h13a1 1 0 0 1 1 1v7H20V8z" fill="#DFE1E6"/><path d="M20 24h14v7a1 1 0 0 1-1 1H20v-8zM6 16h14v8H6z" fill="#FFF"/><path d="M7 8h13v8H6V9a1 1 0 0 1 1-1z" fill="#DFE1E6"/><path d="M6 24h14v8H7a1 1 0 0 1-1-1v-7z" fill="#FFF"/></g></g></svg>`,
      }}
    />
  );
}
