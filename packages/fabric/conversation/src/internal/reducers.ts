import {
  FETCH_CONVERSATIONS,
  FETCH_CONVERSATIONS_SUCCESS,
  ADD_COMMENT,
  ADD_COMMENT_SUCCESS,
  UPDATE_COMMENT,
  UPDATE_COMMENT_SUCCESS,
  CREATE_CONVERSATION_SUCCESS,
} from './actions';
import { Action, State } from './store';

export const reducers = {
  [FETCH_CONVERSATIONS](state: State, action: Action) {
    return {
      ...state,
    };
  },

  [FETCH_CONVERSATIONS_SUCCESS](state: State, action: Action) {
    return {
      ...state,
      conversations: action.payload,
    };
  },

  [ADD_COMMENT](state: State, action: Action) {
    return {
      ...state,
    };
  },

  [ADD_COMMENT_SUCCESS](state: State, action: Action) {
    const { conversations } = state;
    const conversation = conversations.filter(
      c => c.conversationId === action.payload.conversationId,
    )[0];

    const { comments = [] } = conversation;
    conversation.comments = [...comments, action.payload];

    return {
      ...state,
      conversations,
    };
  },

  [UPDATE_COMMENT](state: State, action: Action) {
    return {
      ...state,
    };
  },

  [UPDATE_COMMENT_SUCCESS](state: State, action: Action) {
    const { conversations } = state;
    const conversation = conversations.filter(
      c => c.conversationId === action.payload.conversationId,
    )[0];

    const { comments = [] } = conversation;
    const [comment] = comments.filter(
      c => c.commentId === action.payload.commentId,
    );

    comment.document = action.payload.document;

    return {
      ...state,
      conversations,
    };
  },

  [CREATE_CONVERSATION_SUCCESS](state: State, action: Action) {
    const { conversations } = state;
    conversations.push(action.payload);

    return {
      ...state,
      conversations,
    };
  },
};
