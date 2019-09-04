import styled from 'styled-components';
// @ts-ignore: unused variable
// prettier-ignore
import { HTMLAttributes, ClassAttributes, OlHTMLAttributes, ComponentClass } from 'react';

const ListWrapper: ComponentClass<OlHTMLAttributes<{}>> = styled.div`
  /*
    Increasing specificity with double ampersand to ensure these rules take
    priority over the global styles applied to 'ol' elements.
  */
  && {
    list-style-type: none;
    padding-left: 0;
  }
`;

export default ListWrapper;
