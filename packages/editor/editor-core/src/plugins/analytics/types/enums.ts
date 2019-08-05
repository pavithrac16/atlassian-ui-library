export enum EVENT_TYPE {
  OPERATIONAL = 'operational',
  SCREEN = 'screen',
  TRACK = 'track',
  UI = 'ui',
}

export enum ACTION {
  CHANGED_FULL_WIDTH_MODE = 'changedFullWidthMode',
  CHANGED_LAYOUT = 'changedLayout',
  CHANGED_TYPE = 'changedType',
  CHANGED_URL = 'changedUrl',
  CLICKED = 'clicked',
  DELETED = 'deleted',
  DISPATCHED_INVALID_TRANSACTION = 'dispatchedInvalidTransaction',
  EDITOR_MOUNTED = 'mounted',
  FORMATTED = 'formatted',
  INSERTED = 'inserted',
  INVOKED = 'invoked',
  OPENED = 'opened',
  PASTED = 'pasted',
  PASTED_AS_PLAIN = 'pastedAsPlain',
  PROSEMIRROR_RENDERED = 'proseMirrorRendered',
  STARTED = 'started',
  STOPPED = 'stopped',
  SUBSTITUTED = 'autoSubstituted',
  UNLINK = 'unlinked',
  VISITED = 'visited',
  BROWSER_FREEZE = 'browserFreeze',
  SLOW_INPUT = 'slowInput',
}

export enum INPUT_METHOD {
  ASCII = 'ascii',
  AUTO = 'auto',
  AUTO_DETECT = 'autoDetect',
  CARD = 'card',
  CLIPBOARD = 'clipboard',
  DRAG_AND_DROP = 'dragAndDrop',
  EXTERNAL = 'external',
  FORMATTING = 'autoformatting',
  FLOATING_TB = 'floatingToolbar',
  KEYBOARD = 'keyboard',
  INSERT_MENU = 'insertMenu',
  MANUAL = 'manual',
  PICKER = 'picker',
  PICKER_CLOUD = 'cloudPicker',
  QUICK_INSERT = 'quickInsert',
  SHORTCUT = 'shortcut',
  TOOLBAR = 'toolbar',
  TYPEAHEAD = 'typeAhead',
  CONTEXT_MENU = 'contextMenu',
  BUTTON = 'button',
}

export enum ACTION_SUBJECT {
  BUTTON = 'button',
  DOCUMENT = 'document',
  EDITOR = 'editor',
  FEEDBACK_DIALOG = 'feedbackDialog',
  LAYOUT = 'layout',
  MEDIA = 'media',
  MEDIA_SINGLE = 'mediaSingle',
  PANEL = 'panel',
  PICKER = 'picker',
  SMART_LINK = 'smartLink',
  TEXT = 'text',
  TYPEAHEAD = 'typeAhead',
  TABLE = 'table',
}

export enum ACTION_SUBJECT_ID {
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
  MEDIA_LINK = 'mediaLink',
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
  SMART_LINK = 'smartLink',
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
