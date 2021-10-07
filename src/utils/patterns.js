export const forwardTypingRegex = /(\s|\n|^)@/;
export const alphaNumRegex = /[a-zA-Z0-9_]{1}/;
export const backspaceCheckRegex = /(\s|\n|^)(@)([a-zA-Z0-9_])+$/g;
export const usernameReplacementRegex = /@([a-zA-Z0-9_]+)/g;
