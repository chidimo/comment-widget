/* eslint-disable no-unused-vars */
import { useRef, useEffect, useCallback } from 'react';
import { useLoggingReducer } from '../helpers/useLoggingReducer';

import './ContentEditable.css';
import {
  getUsers,
  getCaretCoordinates,
  getCaretHTMLIndex,
  convertNodesToString,
} from './helpers';
import {
  CEReducer,
  initCEState,
  SET_AVAILABLE_USERS,
  SET_COMMENT,
  INCREMENT_MENTION_LENGTH,
  SET_MENTION_START,
  SET_SHOWING_SUGGESTIONS,
  SET_SUGGESTED_USERS,
  RESET_MENTIONING,
} from './reducer';

const webLink = 'https://web.hypothes.is/';

const useCaretIndex = (element) => getCaretHTMLIndex(element);
const useCaretCoordinates = () => getCaretCoordinates();

const regex = /(\s|&nbsp;)@([a-zA-Z]+)(\s|&nbsp;|)/;

export const ContentEditable = () => {
  const editableDiv = useRef();

  const { caretX, caretY } = useCaretCoordinates();
  const { caretPosition } = useCaretIndex(editableDiv.current);

  const [info, dispatch] = useLoggingReducer(CEReducer, initCEState);
  console.log(info);

  const resetMentions = () => dispatch({ type: RESET_MENTIONING });

  const setMentionStart = (payload) =>
    dispatch({ type: SET_MENTION_START, payload });

  const incrementMentionLength = () =>
    dispatch({ type: INCREMENT_MENTION_LENGTH });

  const updateSuggestions = (payload) =>
    dispatch({ type: SET_SUGGESTED_USERS, payload });

  const updateComment = (comment) =>
    dispatch({ type: SET_COMMENT, payload: comment });

  const startSuggestions = () =>
    dispatch({ type: SET_SHOWING_SUGGESTIONS, payload: true });

  console.log({ caretPosition });
  // console.log({ caretX, caretY });

  const getSuggestion = useCallback(
    (query) => {
      let matchingUsers = info.availableUsers;
      console.log('QUERY', query);

      if (query === '') {
        // updateSuggestions(info.availableUsers);
      } else {
        matchingUsers = info.availableUsers.filter((user) => {
          const queryLower = query.toLowerCase();
          const nameMatch = user.name.toLowerCase().includes(queryLower);
          const usernameMatch = user.username
            .toLowerCase()
            .includes(queryLower);

          return nameMatch || usernameMatch;
        });
      }
      console.log('MATCHIN', matchingUsers.length);
      updateSuggestions(matchingUsers);
    },

    [info.availableUsers]
  );

  const handleKeyUp = useCallback(
    (e) => {
      console.log('KEYUPCOUNT');
      const keyCode = e.nativeEvent.code;
      // console.log('KEYBOARDEVENT', e.nativeEvent);

      const t = e.target.innerHTML;
      updateComment(t);

      if (keyCode === 'Backspace') {
        //
      }

      if (info.showSuggestions) {
        const ns = convertNodesToString(editableDiv.current);
        console.log('ns', ns);

        const findSymbol = ns.match(regex);
        console.log('finder', findSymbol);

        // console.log('SHOWING SUGGESTIONS ACTIVE');

        if (keyCode === 'Space') {
          resetMentions();
        } else {
          const searchStr = findSymbol ? findSymbol[2] : '';
          getSuggestion(searchStr);
          incrementMentionLength();
        }
      }

      if (e.shiftKey && keyCode === 'Digit2') {
        getSuggestion('');
        startSuggestions();
        incrementMentionLength();
        setMentionStart(caretPosition);
      }
      return;
    },
    [getSuggestion, caretPosition]
  );

  useEffect(() => {
    getUsers().then((users) => {
      dispatch({ type: SET_AVAILABLE_USERS, payload: users });
    });
  }, []);

  return (
    <div className="widget_parent">
      <div className="comments_viewer">
        <h1>Comments appear here.</h1>
      </div>

      <div className="ce__widget_container">
        <div
          id="suggestionBox"
          className="ce__suggestion_box"
          style={{
            display: info.showSuggestions ? 'block' : 'none',
            left: caretX === 0 ? '60px' : `${caretX + 20}px`,
            bottom: caretY === 0 ? '50px' : `calc(${caretY}px - 85vh)`,
          }}
        >
          {info.suggestedUsers.map((user, idx) => {
            return (
              <div
                key={idx}
                className="ce__suggested_user"
                onClick={() => {
                  const markup = `<a class="suggest" href="${webLink}">@${user.username}</a>`;
                  // console.log(markup);

                  const existing = editableDiv.current.innerHTML;

                  const afterCaret = existing.slice(
                    info.mentionStart + info.mentionLength
                  );
                  const beforeCaret = existing.slice(0, info.mentionStart);

                  const finalHTML = beforeCaret + markup + afterCaret;

                  console.log({ beforeCaret, afterCaret, finalHTML });

                  editableDiv.current.innerHTML = finalHTML;
                  updateComment(finalHTML);
                  console.log('finalHTML', finalHTML);
                  resetMentions();
                }}
              >
                {user.name} ({user.username})
              </div>
            );
          })}
        </div>

        <div
          ref={editableDiv}
          contentEditable
          id="editableDiv"
          className="ce__comment_box"
          onKeyUp={handleKeyUp}
        ></div>
      </div>
    </div>
  );
};
