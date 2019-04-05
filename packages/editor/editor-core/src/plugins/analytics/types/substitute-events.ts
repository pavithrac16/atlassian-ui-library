import { TrackAEP } from './events';
import { I_ACTION, I_ACTION_SUBJECT, ACTION_SUBJECT_ID } from './enums';

export const enum SYMBOL {
  ARROW_RIGHT = 'rightArrow',
  ARROW_LEFT = 'leftArrow',
  ARROW_DOUBLE = 'doubleArrow',
}

export const enum PUNC {
  DASH = 'emDash',
  ELLIPSIS = 'ellipsis',
  QUOTE_SINGLE = 'singleQuote',
  QUOTE_DOUBLE = 'doubleQuote',
}

type SubstituteAEP<ActionSubjectID, Attributes> = TrackAEP<
  I_ACTION['SUBSTITUTED'],
  I_ACTION_SUBJECT['TEXT'],
  ActionSubjectID,
  Attributes
>;

type SubstituteProductAEP = SubstituteAEP<
  ACTION_SUBJECT_ID.PRODUCT_NAME,
  {
    product: string;
    originalSpelling: string;
  }
>;

type SubstituteSymbolAEP = SubstituteAEP<
  ACTION_SUBJECT_ID.SYMBOL,
  {
    symbol: SYMBOL.ARROW_RIGHT | SYMBOL.ARROW_LEFT | SYMBOL.ARROW_DOUBLE;
  }
>;

type SubstitutePuncAEP = SubstituteAEP<
  ACTION_SUBJECT_ID.PUNC,
  {
    punctuation:
      | PUNC.DASH
      | PUNC.ELLIPSIS
      | PUNC.QUOTE_SINGLE
      | PUNC.QUOTE_DOUBLE;
  }
>;

export type SubstituteEventPayload =
  | SubstituteProductAEP
  | SubstituteSymbolAEP
  | SubstitutePuncAEP;
