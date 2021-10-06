/* eslint-disable array-bracket-spacing */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { useRef, useEffect, useCallback } from 'react';
import { useLoggingReducer } from '../utils/useLoggingReducer';

import './ContentEditable.css';
import {
  getUsers,
  getCaretMeta,
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
  TOGGLE_SUGGESTIONS,
  SET_SUGGESTED_USERS,
  RESET_MENTIONING,
} from './reducer';

const webLink = 'https://web.hypothes.is/';

const useCaretData = (el) => getCaretMeta(el);

const keyCodes = ['keyA', 'keyB'];

const atMatcher = /(\s|&nbsp;|^)@/gm;
const regex = /(\s|\n|&nbsp;)@([a-zA-Z0-9_-]+)(\s|&nbsp;|)/m;
const pattern = /(\s|\n|&nbsp;)@([a-zA-Z0-9_-])+/im;

export const ContentEditable = () => {
  const editDiv = useRef();

  const { caretX, caretY, caretPosition } = useCaretData(editDiv.current);
  const [info, dispatch] = useLoggingReducer(CEReducer, initCEState);

  // console.log({ caretX, caretY, caretPosition });
  // console.log(info);
  // console.log(editDiv?.current?.innerHTML);

  const showSuggestionsOnLoneAt = useCallback(() => {
    const selection = getChildNodesAsText(editDiv.current, { asNodes: false });
    const joinText = selection.join('');
    console.log({ selection, joinText });
    const nodeAsString = castNodesToString(editDiv.current);
    const atIsAlone = nodeAsString.match(atMatcher);
    console.log({ nodeAsString, atIsAlone });

    if (atIsAlone) {
      dispatch({ type: TOGGLE_SUGGESTIONS, payload: true });
    } else {
      dispatch({ type: TOGGLE_SUGGESTIONS, payload: false });
    }
    return;
  }, [editDiv.current]);

  const getSuggestion = useCallback(
    (query) => {
      let matchingUsers = info.allUsers;
      console.log('QUERY', query);

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

      // console.log('MATCHIN', matchingUsers.length);
      dispatch({ type: SET_SUGGESTED_USERS, payload: matchingUsers });
    },

    [info.allUsers]
  );

  const handleKeyDown = useCallback((e) => {
    const shiftKey = e.shiftKey;
    const keyCode = e.nativeEvent.code;

    // console.log('KEYDOWN ACTIVATED', keyCode, shiftKey);

    if (!shiftKey && keyCode === 'Enter') {
      const comment = e.target.innerHTML;
      dispatch({
        type: SAVE_COMMENT,
        payload: { user: 'currentUser', content: comment },
      });
      editDiv.current.innerHTML = '';
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
        showSuggestionsOnLoneAt();
      }

      if (keyCode === 'Backspace') {
        showSuggestionsOnLoneAt();
      }

      const comment = e.target.innerHTML;

      dispatch({ type: SET_COMMENT, payload: comment });

      if (info.showUsers && keyCode === 'Space') {
        dispatch({ type: RESET_MENTIONING });
        return;
      }

      if (info.showUsers && keyCode !== 'Space') {
        const ns = castNodesToString(editDiv.current);
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
    [getSuggestion, info.showUsers]
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

        <div className="ce__comments_list">
          {info.commentsList.map((comment, idx) => {
            const { user, content: __html } = comment;
            return (
              <div key={idx} className="ce__single_comment">
                <p className="">{user}</p>
                <div dangerouslySetInnerHTML={{ __html }} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="ce__widget_container">
        <div
          id="suggestionBox"
          data-testid='suggestionBox'
          className="ce__suggestion_box"
          style={{
            display: info.showUsers ? 'block' : 'none',
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

                  const existing = editDiv.current.innerHTML;

                  console.log({ existing });

                  const finalHTML = existing.replace(pattern, markup);
                  editDiv.current.innerHTML = finalHTML;

                  console.log('finalHTML', finalHTML);

                  dispatch({ type: SET_COMMENT, payload: finalHTML });
                  dispatch({ type: RESET_MENTIONING });
                  setSelectionOffset(editDiv.current, caretPosition);
                  return;
                }}
              >
                {user.name} ({user.username})
              </div>
            );
          })}
        </div>

        <div
          ref={editDiv}
          contentEditable
          id="editDiv"
          data-testid="editDiv"
          className="ce__comment_box"
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>
    </div>
  );
};
