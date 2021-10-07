import { useState, useCallback, useEffect } from 'react';

import './TextAreaWidget.scss';

import { Widget } from './Widget';
import { getUsers } from '../utils/actions';

export const TextAreaWidget = () => {
  const [ userList, setUserList ] = useState([]);
  const [ commentList, setCommentLiist ] = useState([]);

  const onSaveComment = useCallback(
    (comment) => {
      setCommentLiist([ ...commentList, { comment, user: 'currentUser' } ]);
    },
    [ commentList ]
  );

  useEffect(() => {
    getUsers().then((users) => setUserList(users));
    return () => setUserList([]);
  }, []);

  return (
    <div className="ta__comments_app">
      <div className="ta__comments_viewer">
        <h1>Comments</h1>

        <div className="ta__comments_list">
          {commentList.map((comment, idx) => {
            return (
              <div key={idx} className="ta__single_comment">
                <p className="username">{comment.user}</p>
                <div dangerouslySetInnerHTML={{ __html: comment.comment }} />
              </div>
            );
          })}
        </div>
      </div>

      <Widget
        userList={userList}
        onSaveComment={onSaveComment}
        user_href_key="avatar_url"
      />
    </div>
  );
};
