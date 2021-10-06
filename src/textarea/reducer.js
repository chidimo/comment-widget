export const SET_COMMENT = 'SET_COMMENT';
export const INITIALIZE_USERS = 'INITIALIZE_USERS';
export const SET_SUGGESTED_USERS = 'SET_SUGGESTED_USERS';
export const TOGGLE_SUGGESTIONS = 'TOGGLE_SUGGESTIONS';
export const SET_SEARCH_STRING = 'SET_SEARCH_STRING';
export const SET_COMMENT_AND_RESET = 'SET_COMMENT_AND_RESET';
export const SET_SELECTED_USER = 'SET_SELECTED_USER';

export const initTEState = {
  search: '',
  comment: '',
  suggestedUsers: [],
  allUsers: [],
  showUsers: false,
  selectedUserIndex: 0,
};

export const CEReducer = (state = initTEState, action) => {
  switch (action.type) {
    case SET_COMMENT:
      return { ...state, comment: action.payload };
    case INITIALIZE_USERS:
      return {
        ...state,
        allUsers: action.payload,
        suggestedUsers: action.payload,
      };
    case SET_SEARCH_STRING:
      return { ...state, search: action.payload };
    case SET_SUGGESTED_USERS:
      return { ...state, suggestedUsers: action.payload };
    case TOGGLE_SUGGESTIONS:
      return { ...state, showUsers: action.payload };
    case SET_SELECTED_USER:
      return { ...state, selectedUserIndex: action.payload };
    case SET_COMMENT_AND_RESET:
      return {
        ...state,
        search: '',
        showUsers: false,
        comment: action.payload,
        suggestedUsers: state.allUsers,
      };
    default:
      return state;
  }
};
