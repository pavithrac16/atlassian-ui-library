// @flow
const prettier = require('prettier');
/**
 * This is the template for an auto-generated icon component.
 */
module.exports = (
  svg /*: () => mixed*/,
  displayName /*: string*/,
  wayHome /*: string*/,
  size /*:? string */,
) => `/**
 * NOTE:
 *
 * This file is automatically generated by the build process.
 * DO NOT CHANGE IT BY HAND or your changes will be lost.
 *
 * To change the format of this file, modify icon/build/glyph-tsx.js.
 */
import React from "react";
import Icon, { Props } from "${wayHome}";

const ${displayName} = (props: Props) => (
  <Icon
    dangerouslySetGlyph={\`${svg.toString()}\`}
    {...props} ${size ? `size="${size}"` : ''} 
  />
);
${displayName}.displayName = "${displayName}";
export default ${displayName};

`;
