# Comment widget

## How to run this project

1. Make sure you have `Node.js` and `npm` installed.
1. `cd` into the app folder
1. To install the project dependencies, run

        yarn

1. To start the project, run

        yarn start

1. Once the project is up and running, visit <http://localhost:3000> to view the project.
1. On the homepage, click on the link `Textarea Widget` to view the comment box in action.

## How to run tests

1. To run tests, use the command

        yarn test


## How to use the comment widget

1. The comment widget is a React component that takes two required `props`: `onSaveComment` and `userList`.
1. `userList` is the list of possible users that can be referenced in a comment.
1. `onSaveComment` is a function that receives the parsed comment as it's only argument.

## Note on usernames

1. `username`s can only contain `a-z`, `A-Z`, `0-9`, `_`, `-`

## Resources

1. <https://javascript.plainenglish.io/how-to-find-the-caret-inside-a-contenteditable-element-955a5ad9bf81>
1. <https://blog.campvanilla.com/reactjs-input-trigger-github-twitter-mentions-8ad1d878110d>
1. <https://awik.io/check-if-element-is-inside-viewport-with-javascript/>
