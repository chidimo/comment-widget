/* eslint-disable no-unused-vars */
const getUserFromList = (username, users) => {
  const user = users.find((u) => u.username === username);
  if (!user) {
    throw new Error(`User ${username} not found`);
  }
  return user;
};

export const processComment = (comment, users) => {
  // console.log(comment, users);

  const parsedComment = comment.replace('@{}', '<br>');

  return parsedComment;
};
