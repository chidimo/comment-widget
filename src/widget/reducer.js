export const SET_COMMENT = 'SET_COMMENT';
export const INCREMENT_MENTION_LENGTH = 'INCREMENT_MENTION_LENGTH';
export const SET_AVAILABLE_USERS = 'SET_AVAILABLE_USERS';
export const SET_MENTION_START = 'SET_MENTION_START';
export const SET_SUGGESTED_USERS = 'SET_SUGGESTED_USERS';
export const SET_SHOWING_SUGGESTIONS = 'SET_SHOWING_SUGGESTIONS';
export const RESET_MENTIONING = 'RESET_MENTIONING';

export const initCEState = {
  comment: '',
  suggestedUsers: [],
  showSuggestions: false,
  mentionLength: 0,
  mentionStart: 0,
  availableUsers: [],
};

export const CEReducer = (state = initCEState, action) => {
  switch (action.type) {
    case SET_COMMENT:
      return { ...state, comment: action.payload };
    case SET_MENTION_START:
      return { ...state, mentionStart: action.payload };
    case INCREMENT_MENTION_LENGTH:
      return { ...state, mentionLength: state.mentionLength + 1 };
    case SET_AVAILABLE_USERS:
      return { ...state, availableUsers: action.payload };
    case SET_SUGGESTED_USERS:
      return { ...state, suggestedUsers: action.payload };
    case SET_SHOWING_SUGGESTIONS:
      return { ...state, showSuggestions: action.payload };
    case RESET_MENTIONING:
      return {
        ...state,
        suggestedUsers: [],
        showSuggestions: false,
        mentionLength: 0,
        mentionStart: 0,
      };
    default:
      return state;
  }
};
