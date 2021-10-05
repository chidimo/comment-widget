export const SET_COMMENT = 'SET_COMMENT';
export const SAVE_COMMENT = 'SAVE_COMMENT';
export const INITIALIZE_USERS = 'INITIALIZE_USERS';
export const SET_SUGGESTED_USERS = 'SET_SUGGESTED_USERS';
export const SET_SHOW_SUGGESTIONS = 'SET_SHOW_SUGGESTIONS';
export const RESET_MENTIONING = 'RESET_MENTIONING';

export const initCEState = {
  commentsList: [],
  comment: '',
  suggestedUsers: [],
  showMentions: false,
  availableUsers: [],
};

export const CEReducer = (state = initCEState, action) => {
  switch (action.type) {
    case SET_COMMENT:
      return { ...state, comment: action.payload };
    case SAVE_COMMENT:
      return {
        ...state,
        comment: '',
        commentsList: state.commentsList.concat(action.payload),
      };
    case INITIALIZE_USERS:
      return {
        ...state,
        availableUsers: action.payload,
        suggestedUsers: action.payload,
      };
    case SET_SUGGESTED_USERS:
      return { ...state, suggestedUsers: action.payload };
    case SET_SHOW_SUGGESTIONS:
      return { ...state, showMentions: action.payload };
    case RESET_MENTIONING:
      return {
        ...state,
        showMentions: false,
        suggestedUsers: state.availableUsers,
      };
    default:
      return state;
  }
};
