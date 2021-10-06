const getUserFromList = (username, users) => {
  const user = users.find((u) => u.username === username);
  if (!user) {
    throw new Error(`User ${username} not found`);
  }
  return user;
};

const pattern = /@([a-zA-Z0-9_-]+)/g;

export const parseMentions = (comment, users) => {
  const usersInComment = [ ...comment.matchAll(pattern) ];
  const referencedUsers = usersInComment.map((refUser) => refUser[1]);

  referencedUsers.forEach((refUser) => {
    const userObject = getUserFromList(refUser, users);
    if (userObject) {
      comment = comment.replace(
        `@${userObject.username}`,
        `<a href="${userObject.avatar_url}">@${userObject.username}</a>`
      );
    }
  });

  const parsedComment = comment.replace('@{}', '<br>');

  return parsedComment;
};
