import { position } from 'caret-pos';
import PropTypes from 'prop-types';

import { useRef, useEffect, useCallback } from 'react';
import { useLoggingReducer } from '../utils/useLoggingReducer';

import './Widget.css';
import {
  CEReducer,
  initTEState,
  INITIALIZE_USERS,
  SET_COMMENT,
  TOGGLE_SUGGESTIONS,
  SET_SUGGESTED_USERS,
  SET_SEARCH_STRING,
  SET_COMMENT_AND_RESET,
} from './reducer';

const useCaretMetaInfo = (el) => {
  if (!el) {
    return { left: 0, top: 0, height: 0, pos: 0 };
  }
  return position(el);
};

const forwardRegex = /(\s|\n|^)@/;
const alphaNumRegex = /[a-zA-Z0-9_-]{1}/;
const backwardRegex = /(\s|\n|^)@[a-zA-Z0-9_-]{1}/;

export const Widget = (props) => {
  const { onSaveComment, userList } = props;

  const textareaWidget = useRef();

  const {
    left: caretX,
    top: caretY,
    pos: caretPosition,
  } = useCaretMetaInfo(textareaWidget.current);

  const [ info, dispatch ] = useLoggingReducer(CEReducer, initTEState);

  const showSuggestionBox = useCallback(
    () => dispatch({ type: TOGGLE_SUGGESTIONS, payload: true }),
    []
  );

  const hideSuggestionBox = useCallback(
    () => dispatch({ type: TOGGLE_SUGGESTIONS, payload: false }),
    []
  );

  const updateSearch = useCallback(
    (value) => dispatch({ type: SET_SEARCH_STRING, payload: value }),
    []
  );

  const saveCommentAndReset = useCallback(
    (payload) => dispatch({ type: SET_COMMENT_AND_RESET, payload }),
    []
  );

  const filterUsers = useCallback(
    (query) => {
      let matchingUsers = info.allUsers;

      if (query.length > 0) {
        matchingUsers = info.allUsers.filter((user) => {
          const queryLower = query.toLowerCase();
          const nameMatch = user.name.toLowerCase().includes(queryLower);
          const usernameMatch = user.username
            .toLowerCase()
            .includes(queryLower);

          return nameMatch || usernameMatch;
        });
      }

      dispatch({ type: SET_SUGGESTED_USERS, payload: matchingUsers });
    },

    [ info.allUsers ]
  );

  const handleKeyDown = useCallback(
    (e) => {
      const key = e.key;
      const keyCode = e.code;
      const shiftKey = e.shiftKey;
      const value = e.target.value;

      if (keyCode === 'Space') {
        updateSearch('');
        hideSuggestionBox();
        return;
      }

      if (shiftKey && keyCode === 'Enter') {
        updateSearch('');
        hideSuggestionBox();
      }

      if (!shiftKey && keyCode === 'Enter') {
        onSaveComment(value);
        saveCommentAndReset('');
        e.preventDefault();
        return;
      }

      if ((shiftKey && keyCode === 'Digit2') || key === '@') {
        const matched = (value + key).match(forwardRegex);

        if (matched) {
          showSuggestionBox();
        } else {
          hideSuggestionBox();
        }
        return;
      }

      if (keyCode === 'Backspace') {
        const search = info.search.substr(0, info.search.length - 1);
        if (info.showUsers) {
          filterUsers(search);
          updateSearch(search);

          if (value[value.length - 1] === '@') {
            hideSuggestionBox();
          }
        } else {
          const matchString = value.substr(0, value.length - 1);
          const matched = matchString.match(backwardRegex);

          if (matched) {
            showSuggestionBox();
          } else {
            hideSuggestionBox();
          }
        }
        return;
      }

      if (key.length === 1 && key.match(alphaNumRegex) && info.showUsers) {
        const search = info.search + key;
        filterUsers(search);
        updateSearch(search);
        return;
      }

      if (
        info.showUsers &&
        (keyCode === 'ArrowDown' || keyCode === 'ArrowUp')
      ) {
        console.log(' HIJACK ARROW KEYS ::::::::: SHOWING MENTIONS');
        return;
      }

      return;
    },
    [ info.showUsers, info.search, onSaveComment ]
  );

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    var text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);

    return;
  }, []);

  useEffect(() => {
    dispatch({ type: INITIALIZE_USERS, payload: userList });
  }, [ userList ]);

  return (
    <div className="ta__widget_container">
      <div
        id="suggestionBox"
        data-testid="suggestionBox"
        className="ta__suggestion_box"
        style={{
          left: `${caretX + 35}px`,
          top: `${caretY + 20}px`,
          display: info.showUsers ? 'block' : 'none',
        }}
      >
        {info.suggestedUsers.length === 0 && <p>No matching user</p>}

        {info.suggestedUsers.map((user, idx) => {
          return (
            <div
              key={idx}
              className="ta__suggested_user"
              onClick={() => {
                const currentValue = textareaWidget.current.value;

                const left = currentValue.substr(
                  0,
                  caretPosition - info.search.length - 1
                );
                const right = currentValue.substr(caretPosition);
                const payload = left + '@' + user.username + right;

                saveCommentAndReset(payload);
                textareaWidget.current.focus();
              }}
            >
              {user.name} ({user.username})
            </div>
          );
        })}
      </div>

      <textarea
        ref={textareaWidget}
        id="textareaWidget"
        data-testid="textareaWidget"
        className="ta__comment_box"
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Write a comment..."
        value={info.comment}
        rows={10}
        onChange={(e) => {
          console.log('Trusted', e);
          dispatch({ type: SET_COMMENT, payload: e.target.value });
        }}
      />
    </div>
  );
};

Widget.propTypes = {
  onSaveComment: PropTypes.func.isRequired,
  userList: PropTypes.array.isRequired,
};
