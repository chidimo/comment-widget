export const SET_COMMENT = 'SET_COMMENT';
export const SAVE_COMMENT = 'SAVE_COMMENT';
export const INITIALIZE_USERS = 'INITIALIZE_USERS';
export const SET_SUGGESTED_USERS = 'SET_SUGGESTED_USERS';
export const TOGGLE_SUGGESTIONS = 'TOGGLE_SUGGESTIONS';
export const RESET_MENTIONING = 'RESET_MENTIONING';

export const initCEState = {
  commentsList: [],
  comment: '',
  suggestedUsers: [],
  showUsers: false,
  allUsers: [],
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
        allUsers: action.payload,
        suggestedUsers: action.payload,
      };
    case SET_SUGGESTED_USERS:
      return { ...state, suggestedUsers: action.payload };
    case TOGGLE_SUGGESTIONS:
      return { ...state, showUsers: action.payload };
    case RESET_MENTIONING:
      return {
        ...state,
        showUsers: false,
        suggestedUsers: state.allUsers,
      };
    default:
      return state;
  }
};
