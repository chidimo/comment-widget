/* eslint-disable array-bracket-spacing */
/* eslint-disable no-console */
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
  INITIALIZE_USERS,
  SET_COMMENT,
  SAVE_COMMENT,
  SET_SHOWING_SUGGESTIONS,
  SET_SUGGESTED_USERS,
  RESET_MENTIONING,
} from './reducer';

const webLink = 'https://web.hypothes.is/';

const useCaretCoordinates = () => getCaretCoordinates();

const regex = /(\s|&nbsp;)@([a-zA-Z]+)(\s|&nbsp;|)/;

export const ContentEditable = () => {
  const editableDiv = useRef();

  const { caretX, caretY } = useCaretCoordinates();
  const [info, dispatch] = useLoggingReducer(CEReducer, initCEState);

  console.log(info);
  console.log(editableDiv?.current?.innerHTML);

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
      dispatch({ type: SET_SUGGESTED_USERS, payload: matchingUsers });
    },

    [info.availableUsers]
  );

  const handleKeyDown = useCallback((e) => {
    const shiftKey = e.shiftKey;
    const keyCode = e.nativeEvent.code;
    console.log('KEYDOWN ACTIVATED', keyCode, shiftKey);
    if (shiftKey && keyCode === 'Digit2') {
      dispatch({ type: SET_SHOWING_SUGGESTIONS, payload: true });
      return;
    }

    if (!shiftKey && keyCode === 'Enter') {
      const comment = e.target.innerHTML;
      dispatch({ type: SAVE_COMMENT, payload: comment });
      editableDiv.current.innerHTML = '';
      return;
    }

    return;
  }, []);

  const handleKeyUp = useCallback(
    (e) => {
      const keyCode = e.nativeEvent.code;
      if (!e.shiftKey && keyCode === 'Enter') {
        //   while(editableDiv.current.firstChild){
        //     editableDiv.current.removeChild(editableDiv.current.firstChild);
        // }
        return;
      }

      const comment = e.target.innerHTML;
      console.log('KEYUP ACTIVATED', keyCode);

      dispatch({ type: SET_COMMENT, payload: comment });

      if (keyCode === 'Backspace') {
        //
      }

      if (info.showMentions && keyCode === 'Space') {
        dispatch({ type: RESET_MENTIONING });
        return;
      }

      if (info.showMentions && keyCode !== 'Space') {
        const ns = convertNodesToString(editableDiv.current);
        console.log('ns', ns);

        const findSymbol = ns.match(regex);
        console.log('finder', findSymbol);

        const searchStr = findSymbol ? findSymbol[2] : '';
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
    <div className="widget_parent">
      <div className="comments_viewer">
        <h1>Comments</h1>

        <div>
          {info.commentsList.map((__html, idx) => {
            return (
              <div
                key={idx}
                className="ce__single_comment"
                dangerouslySetInnerHTML={{ __html }}
              />
            );
          })}
        </div>
      </div>

      <div className="ce__widget_container">
        <div
          id="suggestionBox"
          className="ce__suggestion_box"
          style={{
            display: info.showMentions ? 'block' : 'none',
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
                  const markup = ` <a class="suggest" href="${webLink}">@${user.username}</a>`;

                  const existing = editableDiv.current.innerHTML;

                  console.log({ existing });

                  const finalHTML = existing.replace(regex, markup);
                  editableDiv.current.innerHTML = finalHTML;

                  console.log('finalHTML', finalHTML);

                  dispatch({ type: SET_COMMENT, payload: finalHTML });
                  dispatch({ type: RESET_MENTIONING });
                  return;
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
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>
    </div>
  );
};
