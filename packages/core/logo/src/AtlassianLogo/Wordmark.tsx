/* eslint-disable max-len */
import React, { Component } from 'react';

import { Props, DefaultProps } from '../constants';
import Wrapper from '../Wrapper';

const svg = `<canvas height="32" width="158" aria-hidden="true"></canvas>
<svg viewBox="0 0 158 32" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">>
  <g stroke="none" stroke-width="1" fill-rule="nonzero" fill="inherit">
    <path d="M72.2774003,14.3919316 C72.2774003,17.1872257 73.5880689,19.4065198 78.714802,20.3862846 C81.7735042,21.0215787 82.4142121,21.5100493 82.4142121,22.5187551 C82.4142121,23.4985198 81.7720773,24.1327551 79.6177149,24.1327551 C77.0138964,24.0864379 74.4621351,23.403307 72.1899986,22.1442846 L72.1899986,26.6972257 C73.7339762,27.4465198 75.7727542,28.2822846 79.559566,28.2822846 C84.9192514,28.2822846 87.045788,25.9175787 87.045788,22.4033434 M87.045788,22.4033434 C87.045788,19.0892257 85.2688582,17.5327551 80.2587795,16.4668728 C77.4915351,15.8615787 76.8215745,15.2566375 76.8215745,14.3919316 C76.8215745,13.297814 77.8118891,12.835814 79.6469677,12.835814 C81.8609059,12.835814 84.0455913,13.4986375 86.1136222,14.4208728 L86.1136222,10.0691081 C84.1306149,9.17615406 81.9709058,8.73311319 79.7925183,8.7724022 C74.8405885,8.7724022 72.2774003,10.9048728 72.2774003,14.3919316"></path>
    <polygon points="141.129997 9.07000017 141.129997 28.0038825 145.20791 28.0038825 145.20791 13.5657649 146.926691 17.3983531 152.694132 28.0038825 157.820865 28.0038825 157.820865 9.07000017 153.742952 9.07000017 153.742952 21.2891766 152.198975 17.7442355 147.567399 9.07000017"></polygon>
    <rect x="110.740005" y="9.07000017" width="4.45677247" height="18.9338824"></rect>
    <path d="M105.600792,22.4033434 C105.600792,19.0892257 103.823862,17.5327551 98.8137836,16.4668728 C96.0465393,15.8615787 95.3765786,15.2566375 95.3765786,14.3919316 C95.3765786,13.297814 96.3668932,12.835814 98.2019718,12.835814 C100.41591,12.835814 102.600595,13.4986375 104.668626,14.4208728 L104.668626,10.0691081 C102.685619,9.17615406 100.52591,8.73311319 98.3475224,8.7724022 C93.3955926,8.7724022 90.8324044,10.9048728 90.8324044,14.3919316 C90.8324044,17.1872257 92.143073,19.4065198 97.2698061,20.3862846 C100.328508,21.0215787 100.969216,21.5100493 100.969216,22.5187551 C100.969216,23.4985198 100.327081,24.1327551 98.172719,24.1327551 C95.5689006,24.0864379 93.0171392,23.403307 90.7450027,22.1442846 L90.7450027,26.6972257 C92.2889803,27.4465198 94.3277584,28.2822846 98.1145702,28.2822846 C103.474256,28.2822846 105.600792,25.9175787 105.600792,22.4033434"></path>
    <polygon points="37.6599979 9.07000017 37.6599979 28.0038825 46.8204081 28.0038825 48.2627142 23.9115296 42.1456665 23.9115296 42.1456665 9.07000017"></polygon>
    <polygon points="19.5549984 9.07000017 19.5549984 13.1620002 24.5069282 13.1620002 24.5069282 28.0038825 28.9925967 28.0038825 28.9925967 13.1620002 34.2941332 13.1620002 34.2941332 9.07000017"></polygon>
    <path d="M13.0573091,9.07000017 L7.17856472,9.07000017 L0.505000114,28.0038825 L5.60141023,28.0038825 L6.54748888,24.815059 C8.877531,25.4919503 11.3551322,25.4919503 13.6851743,24.815059 L14.6312529,28.0038825 L19.7287333,28.0038825 L13.0573091,9.07000017 Z M10.1177585,21.4007061 C9.28758405,21.4006584 8.46168544,21.2831148 7.66516023,21.0516472 L10.1177585,12.7889413 L12.5703569,21.0544708 C11.7736914,21.2849831 10.9477956,21.4015755 10.1177585,21.4007061 L10.1177585,21.4007061 Z"></path>
    <path d="M62.6019534,9.07000017 L56.7235658,9.07000017 L50.0500011,28.0038825 L55.1474815,28.0038825 L56.0935601,24.815059 C58.4236023,25.4919503 60.9012034,25.4919503 63.2312455,24.815059 L64.1773242,28.0038825 L69.2748045,28.0038825 L62.6019534,9.07000017 Z M59.6627596,21.4007061 C58.8325851,21.4006584 58.0066865,21.2831148 57.2101613,21.0516472 L59.6627596,12.7889413 L62.1153579,21.0544708 C61.3186924,21.2849831 60.4927966,21.4015755 59.6627596,21.4007061 L59.6627596,21.4007061 Z"></path>
    <path d="M131.256954,9.07000017 L125.378566,9.07000017 L118.705002,28.0038825 L123.802482,28.0038825 L124.748561,24.815059 C127.078603,25.4919503 129.556204,25.4919503 131.886246,24.815059 L132.832325,28.0038825 L137.930162,28.0038825 L131.256954,9.07000017 Z M128.315977,21.4007061 C127.485802,21.4006584 126.659903,21.2831148 125.863378,21.0516472 L128.315977,12.7889413 L130.768575,21.0544708 C129.971909,21.2849831 129.146014,21.4015755 128.315977,21.4007061 L128.315977,21.4007061 Z"></path>
  </g>
</svg>`;

export default class AtlassianWordmark extends Component<Props> {
  static defaultProps = DefaultProps;

  render() {
    return <Wrapper {...this.props} svg={svg} />;
  }
}