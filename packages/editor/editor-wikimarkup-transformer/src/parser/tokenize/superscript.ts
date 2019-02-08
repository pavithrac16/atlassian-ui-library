import { Node as PMNode } from 'prosemirror-model';
import { Token, TokenType, TokenParser } from './';
import { hasAnyOfMarks } from '../utils/text';
import { commonFormatter } from './common-formatter';
import { parseString } from '../text';

export const superscript: TokenParser = ({
  input,
  position,
  schema,
  tokenErrCallback,
}) => {
  /**
   * The following token types will be ignored in parsing
   * the content of a  mark
   */
  const ignoreTokenTypes = [
    TokenType.DOUBLE_DASH_SYMBOL,
    TokenType.TRIPLE_DASH_SYMBOL,
    TokenType.QUADRUPLE_DASH_SYMBOL,
  ];
  // Adding subsup mark to all text
  const contentDecorator = (n: PMNode) => {
    const mark = schema.marks.subsup.create({ type: 'sup' });
    // We don't want to mix `code` mark with others
    if (n.type.name === 'text' && !hasAnyOfMarks(n, ['subsup', 'code'])) {
      return n.mark([...n.marks, mark]);
    }
    return n;
  };

  const rawContentProcessor = (raw: string, length: number): Token => {
    const content = parseString({
      schema,
      tokenErrCallback,
      ignoreTokens: ignoreTokenTypes,
      input: raw,
    });
    const decoratedContent = content.map(contentDecorator);

    return {
      type: 'pmnode',
      nodes: decoratedContent,
      length,
    };
  };

  return commonFormatter(input, position, schema, {
    opening: '^',
    closing: '^',
    rawContentProcessor,
  });
};
