import { usernameReplacementRegex } from './patterns';

const getUserFromList = (username, users) => {
  const user = users.find((u) => u.username === username);
  if (!user) {
    throw new Error(`User ${username} not found`);
  }
  return user;
};

export const parseMentions = (comment, users, user_href_key) => {
  const usersInComment = [ ...comment.matchAll(usernameReplacementRegex) ];
  const referencedUsers = usersInComment.map((refUser) => refUser[1]);

  referencedUsers.forEach((refUser) => {
    const userObject = getUserFromList(refUser, users);
    if (userObject) {
      comment = comment.replace(
        `@${userObject.username}`,
        `<a href="${userObject[user_href_key]}">@${userObject.username}</a>`
      );
    }
  });

  const parsedComment = comment.replace('@{}', '<br>');

  return parsedComment;
};
