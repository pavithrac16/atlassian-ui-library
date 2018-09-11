// @flow
/* eslint-disable max-len */
import React, { Component } from 'react';
import uuid from 'uuid';

import { type Props, DefaultProps } from '../constants';
import Wrapper from '../styledWrapper';

const svg = (iconGradientStart: string, iconGradientStop: string) => {
  const id = uuid();
  return `<canvas height="32" width="118" aria-hidden="true"></canvas>
  <svg viewBox="0 0 118 32" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
    <defs>
      <linearGradient x1="49.9923722%" y1="107.31548%" x2="49.9923722%" y2="38.7491835%" id="${id}">
        <stop stop-color="${iconGradientStart}" ${
    iconGradientStart === 'inherit' ? 'stop-opacity="0.4"' : ''
  } offset="0%"></stop>
        <stop stop-color="${iconGradientStop}" offset="100%"></stop>
      </linearGradient>
    </defs>
    <g stroke="none" stroke-width="1" fill-rule="nonzero">
      <path d="M32,6.918 L32,24 L34.34,24 L34.34,16.616 L43.336,16.616 L43.336,24 L45.676,24 L45.676,6.918 L43.336,6.918 L43.336,14.38 L34.34,14.38 L34.34,6.918 L32,6.918 Z M49.524,7.568 C49.524,8.556 50.174,9.128 51.084,9.128 C51.994,9.128 52.644,8.556 52.644,7.568 C52.644,6.58 51.994,6.008 51.084,6.008 C50.174,6.008 49.524,6.58 49.524,7.568 Z M49.94,24 L52.176,24 L52.176,11 L49.94,11 L49.94,24 Z M61.926,24.26 C60.028,24.26 58.572,23.402 57.792,21.712 L57.792,29.07 L55.556,29.07 L55.556,11 L57.792,11 L57.792,13.34 C58.624,11.624 60.184,10.74 62.186,10.74 C65.644,10.74 67.386,13.678 67.386,17.5 C67.386,21.166 65.566,24.26 61.926,24.26 Z M65.15,17.5 C65.15,14.38 63.902,12.82 61.588,12.82 C59.586,12.82 57.792,14.094 57.792,16.98 L57.792,18.02 C57.792,20.906 59.43,22.18 61.328,22.18 C63.85,22.18 65.15,20.516 65.15,17.5 Z M79.164,21.66 C78.358,21.946 77.526,22.128 76.2,22.128 C72.794,22.128 71.39,19.996 71.39,17.474 C71.39,14.952 72.768,12.82 76.148,12.82 C77.37,12.82 78.254,13.054 79.086,13.444 L79.086,11.364 C78.072,10.896 77.162,10.74 75.992,10.74 C71.364,10.74 69.206,13.548 69.206,17.474 C69.206,21.452 71.364,24.26 75.992,24.26 C77.188,24.26 78.384,24.078 79.164,23.662 L79.164,21.66 Z M92.762,16.382 C92.762,12.716 91.15,10.74 88.238,10.74 C86.366,10.74 84.806,11.624 83.948,13.158 L83.948,5.566 L81.712,5.566 L81.712,24 L83.948,24 L83.948,16.772 C83.948,14.146 85.378,12.768 87.458,12.768 C89.59,12.768 90.526,14.094 90.526,16.772 L90.526,24 L92.762,24 L92.762,16.382 Z M104.722,24 L104.722,21.66 C103.89,23.376 102.33,24.26 100.328,24.26 C96.87,24.26 95.128,21.322 95.128,17.5 C95.128,13.834 96.948,10.74 100.588,10.74 C102.486,10.74 103.942,11.598 104.722,13.288 L104.722,11 L106.958,11 L106.958,24 L104.722,24 Z M97.364,17.5 C97.364,20.62 98.612,22.18 100.926,22.18 C102.928,22.18 104.722,20.906 104.722,18.02 L104.722,16.98 C104.722,14.094 103.084,12.82 101.186,12.82 C98.664,12.82 97.364,14.484 97.364,17.5 Z M113.432,19.892 L113.432,13.08 L116.89,13.08 L116.89,11 L113.432,11 L113.432,8.244 L111.248,8.244 L111.248,11 L109.142,11 L109.142,13.08 L111.248,13.08 L111.248,19.944 C111.248,22.362 112.6,24 115.382,24 C116.058,24 116.5,23.896 116.89,23.792 L116.89,21.634 C116.5,21.712 116.006,21.816 115.486,21.816 C114.108,21.816 113.432,21.036 113.432,19.892 Z" fill="inherit" fill-rule="evenodd"></path>
      <path d="M19.6,22.7029032 C19.6,22.7029032 19.7018182,22.6354839 19.8690909,22.5077419 C22.3054545,20.6696774 23.8363636,18.0012903 23.8363636,15.0312903 C23.8363636,9.49225806 18.4981818,5 11.9163636,5 C5.33454545,5 0,9.49225806 0,15.0312903 C0,20.5703226 5.33454545,25.0696774 11.9163636,25.0696774 C12.7567504,25.0697985 13.5953899,24.9949712 14.4218182,24.846129 L14.68,24.8 C16.3563636,25.8645161 18.7927273,26.7303226 20.9236364,26.7303226 C21.5890909,26.7303226 21.8981818,26.2016129 21.4763636,25.6658065 C20.8327273,24.8709677 19.9454545,23.653871 19.6,22.7029032 Z M18.1454545,18.3170968 C17.4363636,19.3532258 15.2363636,21.1167742 11.9345455,21.1167742 L11.8909091,21.1167742 C8.58545455,21.1167742 6.38545455,19.3425806 5.68,18.3170968 C5.53808129,18.1650868 5.44347999,17.9767692 5.40727273,17.7741935 C5.39624517,17.6454445 5.43979179,17.5179134 5.52775434,17.4213496 C5.61571689,17.3247859 5.74040319,17.267634 5.87272727,17.2632258 C5.98897276,17.2669565 6.10152459,17.3039774 6.19636364,17.3696774 C7.81185179,18.6526513 9.82983722,19.355387 11.9127273,19.3603226 L11.9127273,19.3603226 C14.0056863,19.3822708 16.0370226,18.669488 17.6363636,17.3519355 C17.7221026,17.2763864 17.8335689,17.2346492 17.9490909,17.2348387 C18.2107657,17.2348313 18.423457,17.4407925 18.4254545,17.696129 C18.3948883,17.9230374 18.3018978,18.1376272 18.1563636,18.3170968 L18.1454545,18.3170968 Z" fill="url(#${id})" fill-rule="nonzero"></path>
    </g>
  </svg>`;
};

export default class HipchatLogo extends Component<Props> {
  static defaultProps = { ...DefaultProps, label: 'Hipchat Logo' };

  render() {
    const { label, iconGradientStart, iconGradientStop } = this.props;
    return (
      <Wrapper
        aria-label={label}
        dangerouslySetInnerHTML={{
          __html: svg(String(iconGradientStart), String(iconGradientStop)),
        }}
        {...this.props}
      />
    );
  }
}
