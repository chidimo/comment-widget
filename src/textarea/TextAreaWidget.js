/* eslint-disable array-bracket-spacing */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import { useState, useEffect } from 'react';

import './TextAreaWidget.css';
import { getUsers } from './helpers';

import { Widget } from './Widget';

export const TextAreaWidget = () => {
  const [userList, setUserList] = useState([]);
  const [commentList, setCommentLiist] = useState([]);
  console.log(commentList);

  const onSaveComment = (comment) => {
    console.log(comment);
    setCommentLiist([...commentList, { comment, user: 'currentUser' }]);
  };

  useEffect(() => {
    getUsers().then((users) => setUserList(users));
  }, []);

  return (
    <div className="ta__widget_parent">
      <div className="ta__comments_viewer">
        <h1>Comments</h1>

        <div className="ta__comments_list">
          {commentList.map((comment, idx) => {
            return (
              <div key={idx} className="ta__single_comment">
                <p className="">{comment.user}</p>
                <div>{comment.comment}</div>
              </div>
            );
          })}
        </div>
      </div>

      <Widget userList={userList} onSaveComment={onSaveComment} />
    </div>
  );
};
