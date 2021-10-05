/* eslint-disable array-bracket-spacing */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { position, offset } from 'caret-pos';

import { useRef, useEffect, useCallback } from 'react';
import { useLoggingReducer } from '../utils/useLoggingReducer';

import './TextAreaWidget.css';
import {
  getUsers,
  getCaretMetaInfo,
  castNodesToString,
  setSelectionOffset,
  getChildNodesAsText,
} from './helpers';
import {
  CEReducer,
  initCEState,
  INITIALIZE_USERS,
  SET_COMMENT,
  SAVE_COMMENT,
  SET_SHOW_SUGGESTIONS,
  SET_SUGGESTED_USERS,
  RESET_MENTIONING,
} from './reducer';

const webLink = 'https://web.hypothes.is/';

const useCaretMetaInfo = (el) => {
  if (el) {
    return position(el);
  }
  return { left: 0, top: 0, height: 0, pos: 0 };
};

const atMatcher = /(\s|&nbsp;|^)@/gm;
const regex = /(\s|&nbsp;|^)@([a-zA-Z]+)(\s|&nbsp;|)/m;
const pattern = /(\s|\n|&nbsp;)@([a-zA-Z0-9_-]){0,}/gim;

export const TextAreaWidget = () => {
  const textareaWidget = useRef();

  const {
    left: caretX,
    top: caretY,
    height: caretHeight,
    pos: caretPosition,
  } = useCaretMetaInfo(textareaWidget.current);

  const [info, dispatch] = useLoggingReducer(CEReducer, initCEState);

  console.log({ caretX, caretY, caretHeight, caretPosition });
  // console.log(info);
  console.log(textareaWidget?.current);

  const showSuggestionsOnMatch = useCallback(() => {
    const selection = getChildNodesAsText(textareaWidget.current, {
      asNodes: false,
    });
    const joinText = selection.join('');
    console.log({ selection, joinText });
    const nodeAsString = castNodesToString(textareaWidget.current);
    const atIsAlone = nodeAsString.match(atMatcher);
    console.log({ nodeAsString, atIsAlone });

    if (atIsAlone) {
      dispatch({ type: SET_SHOW_SUGGESTIONS, payload: true });
    } else {
      dispatch({ type: SET_SHOW_SUGGESTIONS, payload: false });
    }
    return;
  }, [textareaWidget.current]);

  const getSuggestion = useCallback(
    (query) => {
      let matchingUsers = info.availableUsers;
      console.log('QUERY', query);

      if (query.length > 0) {
        matchingUsers = info.availableUsers.filter((user) => {
          const queryLower = query.toLowerCase();
          const nameMatch = user.name.toLowerCase().includes(queryLower);
          const usernameMatch = user.username
            .toLowerCase()
            .includes(queryLower);

          return nameMatch || usernameMatch;
        });
      }

      // console.log('MATCHIN', matchingUsers.length);
      dispatch({ type: SET_SUGGESTED_USERS, payload: matchingUsers });
    },

    [info.availableUsers]
  );

  const handleKeyDown = useCallback((e) => {
    const shiftKey = e.shiftKey;
    const keyCode = e.nativeEvent.code;

    // console.log('KEYDOWN ACTIVATED', keyCode, shiftKey);

    if (!shiftKey && keyCode === 'Enter') {
      dispatch({
        type: SAVE_COMMENT,
        payload: { user: 'currentUser' },
      });
      return;
    }

    return;
  }, []);

  const handleKeyUp = useCallback(
    (e) => {
      const shiftKey = e.shiftKey;
      const keyCode = e.nativeEvent.code;
      // console.log('KEYUP ACTIVATED', keyCode);

      if (!shiftKey && keyCode === 'Enter') {
        return;
      }

      if (shiftKey && keyCode === 'Digit2') {
        showSuggestionsOnMatch();
      }

      if (keyCode === 'Backspace') {
        showSuggestionsOnMatch();
      }

      const comment = e.target.innerHTML;

      dispatch({ type: SET_COMMENT, payload: comment });

      if (info.showMentions && keyCode === 'Space') {
        dispatch({ type: RESET_MENTIONING });
        return;
      }

      if (info.showMentions && keyCode !== 'Space') {
        const ns = castNodesToString(textareaWidget.current);
        console.log('ns', ns);

        const findSymbol = ns.match(pattern);
        console.log('findSymbol', findSymbol);

        let searchStr = '';

        if (findSymbol) {
          console.log('findSymbol', findSymbol.length, findSymbol);
          if (findSymbol.length > 1) {
            searchStr = findSymbol[2];
          }
        }

        getSuggestion(searchStr);
        return;
      }
      return;
    },
    [getSuggestion, info.showMentions]
  );

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    var text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);

    return;
  }, []);

  useEffect(() => {
    getUsers().then((users) => {
      dispatch({ type: INITIALIZE_USERS, payload: users });
    });
  }, []);

  return (
    <div className="ta__widget_parent">
      <div className="ta__comments_viewer">
        <h1>Comments</h1>

        <div className="ta__comments_list">
          {info.commentsList.map((comment, idx) => {
            const { user, content } = comment;
            return (
              <div key={idx} className="ta__single_comment">
                <p className="">{user}</p>
                <div>{content}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ta__widget_container">
        <div
          id="suggestionBox"
          className="ta__suggestion_box"
          style={{
            // display: info.showMentions ? 'block' : 'none',
            left: caretX === 0 ? '60px' : `${caretX + 20}px`,
            bottom: caretY === 0 ? '100px' : `${caretY - 20}px`,
          }}
        >
          {info.suggestedUsers.map((user, idx) => {
            return (
              <div
                key={idx}
                className="ta__suggested_user"
                onClick={() => {
                  const markup = ` <a class="suggest" href="${webLink}">@${user.username}</a>`;

                  const existing = textareaWidget.current.innerHTML;

                  console.log({ existing });

                  const finalHTML = existing.replace(pattern, markup);
                  textareaWidget.current.innerHTML = finalHTML;

                  console.log('finalHTML', finalHTML);

                  dispatch({ type: SET_COMMENT, payload: finalHTML });
                  dispatch({ type: RESET_MENTIONING });
                  setSelectionOffset(textareaWidget.current, caretPosition);
                  return;
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
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Write a comment..."
          value={info.comment}
          onChange={(e) => {
            dispatch({ type: SET_COMMENT, payload: e.target.value });
          }}
        />
      </div>
    </div>
  );
};
