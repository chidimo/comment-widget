import { userData } from './UserData';

export const getUsers = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(userData), 1000);
  });

export const getCaretCoordinates = () => {
  // https://javascript.plainenglish.io/how-to-find-the-caret-inside-a-contenteditable-element-955a5ad9bf81

  let caretX = 0;
  let caretY = 0;
  const isSupported = typeof window.getSelection !== 'undefined';

  if (isSupported) {
    const selection = window.getSelection();
    // Check if there is a selection (i.e. cursor in place)
    if (selection.rangeCount !== 0) {
      // Clone the range
      const range = selection.getRangeAt(0).cloneRange();
      // Collapse the range to the start, so there are not multiple chars selected
      range.collapse(true);
      // getCientRects returns all the positioning information we need
      const rect = range.getClientRects()[0];
      if (rect) {
        caretX = rect.left; // since the caret is only 1px wide, left == right
        caretY = rect.top; // top edge of the caret
      }
    }
  }
  return { caretX, caretY };
};

export const getCaretIndex = (element) => {
  let position = 0;
  const isSupported = typeof window.getSelection !== 'undefined';

  if (isSupported) {
    const selection = window.getSelection();
    if (selection.rangeCount !== 0) {
      element.focus();
      const range = window.getSelection().getRangeAt(0);

      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      position = preCaretRange.toString().length;
    }
  }
  return position;
};

export const getCaretHTMLIndex = (element) => {
  // select everything before the caret and count the number of characters

  if (typeof window.getSelection === 'undefined') {
    return;
  }

  let caretPosition = 0;
  const selection = window.getSelection();

  if (selection.rangeCount === 0) {
    // throw new Error("No selection");
    return { caretPosition };
  }

  element.focus();
  const range = window.getSelection().getRangeAt(0);

  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);

  const clonedContents = preCaretRange.cloneContents();

  clonedContents.childNodes.forEach((cn) => {
    // preserve this order
    // I expect only <a></a> tags and plain text

    if (cn.outerHTML) {
      caretPosition += cn.outerHTML.length;
    }
    if (cn.textContent) {
      const text = cn.textContent.replaceAll(' ', '&nbsp;');
      caretPosition += text.length;
    }
  });

  return { caretPosition };
};

export const setCaretIndex = (element, position) => {
  const isSupported = typeof window.getSelection !== 'undefined';
  if (isSupported) {
    element.focus();
    element.setSelectionRange(0, position);
    // document.getSelection().collapse(element, position);
  }
  return;
};

export const convertNodesToString = (element) => {
  // select everything before the caret and count the number of characters

  if (typeof window.getSelection === 'undefined') {
    return;
  }

  let nodeString = '';
  const selection = window.getSelection();

  if (selection.rangeCount === 0) {
    // throw new Error("No selection");
    return { nodeString };
  }

  element.focus();
  const range = window.getSelection().getRangeAt(0);

  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);

  const clonedContents = preCaretRange.cloneContents();

  clonedContents.childNodes.forEach((cn) => {
    // preserve this order
    // I expect only <a></a> tags and plain text

    if (cn.outerHTML) {
      nodeString += cn.outerHTML;
    }
    if (cn.textContent) {
      nodeString += cn.textContent;
    }
  });

  return nodeString;
};
