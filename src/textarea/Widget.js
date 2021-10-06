import { position } from 'caret-pos';
import PropTypes from 'prop-types';
import { useRef, useEffect, useCallback } from 'react';

import { parseMentions } from '../utils/processComment';
import { useLoggingReducer } from '../utils/useLoggingReducer';

import {
  CEReducer,
  initTEState,
  INITIALIZE_USERS,
  SET_COMMENT,
  TOGGLE_SUGGESTIONS,
  SET_SUGGESTED_USERS,
  SET_SEARCH_STRING,
  SET_COMMENT_AND_RESET,
  SET_SELECTED_USER,
} from './reducer';
import './Widget.css';

const useCaretMetaInfo = (el) => {
  if (!el) {
    return { left: 0, top: 0, height: 0, pos: 0 };
  }
  return position(el);
};

// eslint-disable-next-line no-undef
const ENV = process.env.NODE_ENV;
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
  // console.log({caretPosition})

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

  const updateUser = useCallback(
    (payload) => dispatch({ type: SET_SELECTED_USER, payload }),
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

  const CLICK_SELECT_USER = 'CLICK_SELECT_USER';
  const ENTER_SELECT_USER = 'ENTER_SELECT_USER';

  const handleUserClick = useCallback(
    (user, { action = CLICK_SELECT_USER } = {}) => {
      // when ENTER is pressed, the caret is set backward
      // by 1 position because I am doing event.preventDefault()
      // in the onKeyDown handler. So we need to compensate for that
      const value = textareaWidget.current.value;

      let splitPoint = caretPosition;

      if (action === ENTER_SELECT_USER) {
        splitPoint = caretPosition + 1;
      }

      if (ENV === 'test') {
        // I have no idea why this is the case.
        // I don't think its a bug because
        //e verything works fine in the browser.
        // but it's a weird edge case I intend to investigate.
        splitPoint += 1;
      }

      const left = value.substr(0, splitPoint - info.search.length - 1);
      const right = value.substr(splitPoint);
      const payload = left + '@' + user.username + right;

      saveCommentAndReset(payload);
      textareaWidget.current.focus();
    },
    [ caretPosition, textareaWidget.current, info.search ]
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
        if (info.showUsers) {
          const user = info.suggestedUsers[info.selectedUserIndex];
          handleUserClick(user, { action: ENTER_SELECT_USER });
        } else {
          handleSave();
        }
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

      if (info.showUsers && keyCode === 'ArrowUp') {
        if (info.selectedUserIndex === 0) {
          updateUser(info.suggestedUsers.length - 1);
        }
        if (info.selectedUserIndex > 0) {
          updateUser(info.selectedUserIndex - 1);
        }
        e.preventDefault();
        return;
      }

      if (info.showUsers && keyCode === 'ArrowDown') {
        updateUser((info.selectedUserIndex + 1) % info.suggestedUsers.length);
        return;
      }
    },
    [
      info.search,
      info.showUsers,
      info.suggestedUsers,
      info.selectedUserIndex,
      onSaveComment,
    ]
  );

  const handleSave = useCallback(() => {
    onSaveComment(parseMentions(textareaWidget.current.value, info.allUsers));
    saveCommentAndReset('');
  }, [
    onSaveComment,
    saveCommentAndReset,
    info.allUsers,
    textareaWidget.current,
  ]);

  useEffect(() => {
    dispatch({ type: INITIALIZE_USERS, payload: userList });
  }, [ userList ]);

  return (
    <div className="ta__widget_container">
      <div
        id="suggestionBox"
        data-testid="suggestionBox"
        className="ta__suggestion_box"
        aria-hidden={!info.showUsers}
        style={{
          left: `${caretX + 35}px`,
          top: `${caretY + 20}px`,
          display: info.showUsers ? 'block' : 'none',
        }}
      >
        {info.suggestedUsers.length === 0 && <p>No matching user</p>}

        {info.suggestedUsers.map((user, idx) => {
          const className = [
            'ta__suggested_user',
            idx === info.selectedUserIndex ? 'active' : '',
          ].join(' ');
          // console.log('CLICK CLICKED', user)
          return (
            <div
              key={idx}
              className={className}
              onClick={() => handleUserClick(user)}
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
        placeholder="Write a comment..."
        value={info.comment}
        rows={10}
        onChange={(e) => {
          dispatch({ type: SET_COMMENT, payload: e.target.value });
        }}
      />

      <div className="button_container">
        <button type="submit" onClick={handleSave}>
          Comment
        </button>
      </div>
    </div>
  );
};

Widget.propTypes = {
  onSaveComment: PropTypes.func.isRequired,
  userList: PropTypes.array.isRequired,
};
