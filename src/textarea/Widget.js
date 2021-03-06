import { position } from 'caret-pos';
import PropTypes from 'prop-types';
import { useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';

import { parseMentions } from '../utils/processComment';
import { useLoggingReducer } from '../utils/useLoggingReducer';
import {
  forwardTypingRegex,
  backspaceCheckRegex,
  alphaNumRegex,
} from '../utils/patterns';

import {
  CEReducer,
  initTEState,
  SET_COMMENT,
  INITIALIZE_USERS,
  SET_SELECTED_USER,
  SET_SEARCH_STRING,
  TOGGLE_SUGGESTIONS,
  SET_SUGGESTED_USERS,
  SET_COMMENT_AND_RESET,
} from './reducer';
import './Widget.scss';

const useCaretMetaInfo = (el) => {
  if (!el) {
    return { left: 0, top: 0, height: 0, pos: 0 };
  }
  return position(el);
};

// eslint-disable-next-line no-undef
const ENV = process.env.NODE_ENV;

export const Widget = (props) => {
  const { onSaveComment, userList, user_href_key } = props;

  const textareaWidget = useRef();

  const {
    left: caretX,
    top: caretY,
    pos: caretPosition,
  } = useCaretMetaInfo(textareaWidget.current);

  const [ info, dispatch ] = useLoggingReducer(CEReducer, initTEState);

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
  const showSuggestionBox = useCallback(
    () => dispatch({ type: TOGGLE_SUGGESTIONS, payload: true }),
    []
  );

  const hideSuggestionBox = useCallback(
    () => dispatch({ type: TOGGLE_SUGGESTIONS, payload: false }),
    []
  );

  const updateSearch = useCallback(
    (value) => {
      dispatch({ type: SET_SEARCH_STRING, payload: value });
      filterUsers(value);
    },
    [ filterUsers ]
  );

  const saveCommentAndReset = useCallback(
    (payload) => dispatch({ type: SET_COMMENT_AND_RESET, payload }),
    []
  );

  const updateUser = useCallback(
    (payload) => dispatch({ type: SET_SELECTED_USER, payload }),
    []
  );

  const handleUserClick = useCallback(
    (user) => {
      // when ENTER is pressed, the caret is set backward
      // by 1 position because I am doing event.preventDefault()
      // in the onKeyDown handler. So we need to compensate for that
      const value = textareaWidget.current.value;

      let splitPoint = caretPosition;

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

  const handleSave = useCallback(() => {
    const comm = parseMentions(
      textareaWidget.current.value,
      info.allUsers,
      user_href_key
    );
    onSaveComment(DOMPurify.sanitize(comm));
    saveCommentAndReset('');
  }, [
    onSaveComment,
    saveCommentAndReset,
    info.allUsers,
    textareaWidget.current,
  ]);

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
        return;
      }

      if (!shiftKey && keyCode === 'Enter') {
        if (info.showUsers) {
          const user = info.suggestedUsers[info.selectedUserIndex];
          handleUserClick(user);
        } else {
          handleSave();
        }
        e.preventDefault();
        return;
      }

      if ((shiftKey && keyCode === 'Digit2') || key === '@') {
        const matched = (value + key).match(forwardTypingRegex);

        if (matched) {
          showSuggestionBox();
        } else {
          hideSuggestionBox();
        }
        return;
      }

      if (keyCode === 'Backspace') {
        if (info.showUsers) {
          const search = info.search.substr(0, info.search.length - 1);

          updateSearch(search);

          if (value[value.length - 1] === '@') {
            // this keystroke deletes the @ text
            hideSuggestionBox();
          }
        } else {
          const matchString = value.substr(0, caretPosition - 1);
          const matched = matchString.match(backspaceCheckRegex);

          if (matched) {
            const splitMatch = matched[0].split('@');
            const searchString = splitMatch[splitMatch.length - 1];
            updateSearch(searchString);
            showSuggestionBox();
          } else {
            hideSuggestionBox();
          }
        }
        return;
      }

      if (key.length === 1 && key.match(alphaNumRegex) && info.showUsers) {
        const search = info.search + key;
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
      caretPosition,
      onSaveComment,
    ]
  );

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
          left: `${caretX + 10}px`,
          top: `${caretY + 15}px`,
          display: info.showUsers ? 'block' : 'none',
        }}
      >
        {info.suggestedUsers.length === 0 && (
          <p className="ta__suggested_user">No matching user</p>
        )}

        {info.suggestedUsers.map((user, idx) => {
          const className = [
            'ta__suggested_user',
            idx === info.selectedUserIndex ? 'active' : '',
          ].join(' ');
          return (
            <p
              key={idx}
              className={className}
              onClick={() => handleUserClick(user)}
            >
              {user.name} ({user.username})
            </p>
          );
        })}
      </div>

      <label id="textareaWidgetLabel" htmlFor="textareaWidget">
        Comment:
      </label>
      <textarea
        ref={textareaWidget}
        id="textareaWidget"
        data-testid="textareaWidget"
        className="ta__comment_box"
        onKeyDown={handleKeyDown}
        placeholder="Write a comment..."
        value={info.comment}
        rows={7}
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
  user_href_key: PropTypes.string.isRequired,
};
