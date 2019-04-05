export interface I_EVENT_TYPE {
  UI: 'ui';
  TRACK: 'track';
}

export const EVENT_TYPE: I_EVENT_TYPE = {
  UI: 'ui',
  TRACK: 'track',
};

export interface I_ACTION {
  CHANGED_TYPE: 'changedType';
  CLICKED: 'clicked';
  DELETED: 'deleted';
  FORMATTED: 'formatted';
  INSERTED: 'inserted';
  INVOKED: 'invoked';
  OPENED: 'opened';
  PASTED: 'pasted';
  PASTED_AS_PLAIN: 'pastedAsPlain';
  STARTED: 'started';
  STOPPED: 'stopped';
  SUBSTITUTED: 'autoSubstituted';
  VISITED: 'visited';
}

export const ACTION: I_ACTION = {
  CHANGED_TYPE: 'changedType',
  CLICKED: 'clicked',
  DELETED: 'deleted',
  FORMATTED: 'formatted',
  INSERTED: 'inserted',
  INVOKED: 'invoked',
  OPENED: 'opened',
  PASTED: 'pasted',
  PASTED_AS_PLAIN: 'pastedAsPlain',
  STARTED: 'started',
  STOPPED: 'stopped',
  SUBSTITUTED: 'autoSubstituted',
  VISITED: 'visited',
};

export interface I_INPUT_METHOD {
  ASCII: 'ascii';
  AUTO: 'auto';
  AUTO_DETECT: 'autoDetect';
  CARD: 'card';
  CLIPBOARD: 'clipboard';
  DRAG_AND_DROP: 'dragAndDrop';
  EXTERNAL: 'external';
  FORMATTING: 'autoformatting';
  FLOATING_TB: 'floatingToolbar';
  KEYBOARD: 'keyboard';
  INSERT_MENU: 'insertMenu';
  MANUAL: 'manual';
  PICKER: 'picker';
  PICKER_CLOUD: 'cloudPicker';
  QUICK_INSERT: 'quickInsert';
  SHORTCUT: 'shortcut';
  TOOLBAR: 'toolbar';
  TYPEAHEAD: 'typeAhead';
  CONTEXT_MENU: 'contextMenu';
  BUTTON: 'button';
}

export const INPUT_METHOD: I_INPUT_METHOD = {
  ASCII: 'ascii',
  AUTO: 'auto',
  AUTO_DETECT: 'autoDetect',
  CARD: 'card',
  CLIPBOARD: 'clipboard',
  DRAG_AND_DROP: 'dragAndDrop',
  EXTERNAL: 'external',
  FORMATTING: 'autoformatting',
  FLOATING_TB: 'floatingToolbar',
  KEYBOARD: 'keyboard',
  INSERT_MENU: 'insertMenu',
  MANUAL: 'manual',
  PICKER: 'picker',
  PICKER_CLOUD: 'cloudPicker',
  QUICK_INSERT: 'quickInsert',
  SHORTCUT: 'shortcut',
  TOOLBAR: 'toolbar',
  TYPEAHEAD: 'typeAhead',
  CONTEXT_MENU: 'contextMenu',
  BUTTON: 'button',
};

export interface I_ACTION_SUBJECT {
  BUTTON: 'button';
  DOCUMENT: 'document';
  EDITOR: 'editor';
  MEDIA: 'media';
  PANEL: 'panel';
  PICKER: 'picker';
  SMART_LINK: 'smartLink';
  TEXT: 'text';
  TYPEAHEAD: 'typeAhead';
  TABLE: 'table';
}

export const ACTION_SUBJECT: I_ACTION_SUBJECT = {
  BUTTON: 'button',
  DOCUMENT: 'document',
  EDITOR: 'editor',
  MEDIA: 'media',
  PANEL: 'panel',
  PICKER: 'picker',
  SMART_LINK: 'smartLink',
  TEXT: 'text',
  TYPEAHEAD: 'typeAhead',
  TABLE: 'table',
};

export const enum ACTION_SUBJECT_ID {
  ACTION = 'action',
  ANNOTATE_BUTTON = 'annotateButton',
  BLOCK_QUOTE = 'blockQuote',
  BUTTON_HELP = 'helpButton',
  BUTTON_FEEDBACK = 'feedbackButton',
  CANCEL = 'cancel',
  CARD_INLINE = 'inlineCard',
  CARD_BLOCK = 'blockCard',
  CODE_BLOCK = 'codeBlock',
  DECISION = 'decision',
  DIVIDER = 'divider',
  EMOJI = 'emoji',
  FORMAT_BLOCK_QUOTE = 'blockQuote',
  FORMAT_CODE = 'code',
  FORMAT_COLOR = 'color',
  FORMAT_CLEAR = 'clearFormatting',
  FORMAT_HEADING = 'heading',
  FORMAT_INDENT = 'indentation',
  FORMAT_ITALIC = 'italic',
  FORMAT_LIST_NUMBER = 'numberedList',
  FORMAT_LIST_BULLET = 'bulletedList',
  FORMAT_STRIKE = 'strike',
  FORMAT_STRONG = 'strong',
  FORMAT_SUB = 'subscript',
  FORMAT_SUPER = 'superscript',
  FORMAT_UNDERLINE = 'underline',
  LINE_BREAK = 'lineBreak',
  LINK = 'link',
  LINK_PREVIEW = 'linkPreview',
  MEDIA = 'media',
  MENTION = 'mention',
  PICKER_CLOUD = 'cloudPicker',
  PICKER_EMOJI = 'emojiPicker',
  PRODUCT_NAME = 'productName',
  PANEL = 'panel',
  PUNC = 'punctuation',
  SAVE = 'save',
  SECTION = 'section',
  STATUS = 'status',
  SYMBOL = 'symbol',
  TABLE = 'table',
  TYPEAHEAD_EMOJI = 'emojiTypeAhead',
  TYPEAHEAD_LINK = 'linkTypeAhead',
  TYPEAHEAD_MENTION = 'mentionTypeAhead',
  TYPEAHEAD_QUICK_INSERT = 'quickInsertTypeAhead',

  PASTE_BLOCK_CARD = 'blockCard',
  PASTE_BLOCKQUOTE = 'blockquote',
  PASTE_BODIED_EXTENSION = 'bodiedExtension',
  PASTE_BULLET_LIST = 'bulletList',
  PASTE_CODE_BLOCK = 'codeBlock',
  PASTE_DECISION_LIST = 'decisionList',
  PASTE_EXTENSION = 'extension',
  PASTE_HEADING = 'heading',
  PASTE_MEDIA_GROUP = 'mediaGroup',
  PASTE_MEDIA_SINGLE = 'mediaSingle',
  PASTE_ORDERED_LIST = 'orderedList',
  PASTE_PANEL = 'panel',
  PASTE_PARAGRAPH = 'paragraph',
  PASTE_RULE = 'rule',
  PASTE_TABLE_HEADER = 'tableHeader',
  PASTE_TABLE_CELL = 'tableCell',
  PASTE_TABLE_ROW = 'tableRow',
  PASTE_TABLE = 'table',
  PASTE_TASK_LIST = 'taskList',
}
