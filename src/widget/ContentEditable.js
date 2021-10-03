/* eslint-disable no-unused-vars */
import { useRef, useState, useEffect, useCallback } from "react";

import "./ContentEditable.css";
import { getUsers, getCaretCoordinates } from "./helpers";

const webLink = "https://web.hypothes.is/";

const useCaretCoordinates = () => getCaretCoordinates();

export const ContentEditable = () => {
  const divRef = useRef();

  const [userList, setUsers] = useState([]);
  const [comment, setComment] = useState("");

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  console.log("comment", comment);
  console.log("divRef", divRef.current);

  const onTextChange = (value, props) => {
    const lastChar = this.state.messageText.substr(
      this.state.messageText.length - 1
    );
    const currentChar = value.substr(value.length - 1);
    const spaceCheck = /[^@A-Za-z_]/g;
    props.onTextChanged(value);
    this.setState({
      messageText: value,
    });
    if (value.length === 0) {
      this.setModalVisible(false);
    } else {
      if (spaceCheck.test(lastChar) && currentChar !== "@") {
        this.setModalVisible(false);
      } else {
        const checkSpecialChar = currentChar.match(/[^@A-Za-z_]/);
        if (checkSpecialChar === null || currentChar === "@") {
          const pattern = new RegExp(`\\B@[a-z0-9_-]+|\\B@`, `gi`);
          const matches = value.match(pattern) || [];
          if (matches.length > 0) {
            this.getUserSuggestions(matches[matches.length - 1]);
            this.setModalVisible(true);
          } else {
            this.setModalVisible(false);
          }
        } else if (checkSpecialChar != null) {
          this.setModalVisible(false);
        }
      }
    }
  };

  const { caretX, caretY } = useCaretCoordinates();
  console.log({ caretX, caretY });

  const getSuggestion = useCallback(
    (query) => {
      let matchingUsers = userList;

      if (query === "") {
        // setSuggestedUsers(userList);
      } else {
        matchingUsers = userList.filter((user) => {
          const queryLower = query.toLowerCase();
          const nameMatch = user.name.toLowerCase().includes(queryLower);
          const usernameMatch = user.username
            .toLowerCase()
            .includes(queryLower);

          return nameMatch || usernameMatch;
        });
      }

      setSuggestedUsers(matchingUsers);
    },
    [userList]
  );

  useEffect(() => {
    getUsers().then((users) => {
      setUsers(users);
      setSuggestedUsers(users);
    });
  });

  return (
    <div className="widget_parent">
      <div className="comments_viewer">
        <h1>Comments appear here.</h1>
      </div>

      <div className="ce__widget_container">
        {showSuggestions && (
          <div
            id="suggestionBox"
            className="ce__suggestion_box"
            style={{
              left: caretX === 0 ? "60px" : `${caretX + 20}px`,
              bottom: caretY === 0 ? "50px" : `calc(${caretY}px - 85vh)`,
            }}
          >
            {suggestedUsers.map((user, idx) => {
              return (
                <div
                  key={idx}
                  className="ce__suggested_user"
                  onClick={() => {
                    const markup = `<a class="suggest" href="${webLink}" onClick={window.open(${webLink})}>@${user.username}</a>`;
                    console.log(markup);

                    const existingContent = divRef.current.innerHTML;
                    console.log("existingText", existingContent);

                    const updatedContent = existingContent + markup;

                    divRef.current.innerHTML = updatedContent;
                    setComment(updatedContent);
                  }}
                >
                  {user.name}
                </div>
              );
            })}
          </div>
        )}

        <div
          ref={divRef}
          contentEditable
          className="ce__comment_box"
          onKeyDown={(e) => {
            // console.log("KEYBOARDEVENT", e);

            if (e.shiftKey && e.nativeEvent.code === "Digit2") {
              getSuggestion("");
              setShowSuggestions(true);
            }
          }}
          onInput={(e) => {
            console.log(e.target.innerText);
            setComment(e.target.innerHTML);
          }}
          // dangerouslySetInnerHTML={{ __html: `<a class='suggest' href='https://google.com'>@chidi</a> who are u` }}
        ></div>
      </div>
    </div>
  );
};
