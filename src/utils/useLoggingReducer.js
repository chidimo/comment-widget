/* eslint-disable no-console */
import { useReducer } from 'react';

// eslint-disable-next-line no-undef
const prEnv = process.env;

export const useLoggingReducer = (
  reducer,
  initialState,
  {
    showLogs = () => prEnv.NODE_ENV === 'development',
    collapse = () => true,
  } = {}
) => {
  const [ state, dispatch ] = useReducer(reducer, initialState);

  const loggingDispatch = (action) => {
    if (showLogs()) {
      if (collapse()) {
        console.groupCollapsed(`🚀 ${action.type}`);
      }

      console.log('%c prev state', 'color: gray', state);
      console.log('%cACTION', 'color: #07f', action);
      console.log('%c next state', 'color: #0f0', reducer(state, action));

      if (collapse()) {
        console.groupEnd();
      }
    }
    return dispatch(action);
  };

  return [ state, loggingDispatch ];
};
