import { userData } from '../UserData';

export const getUsers = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(userData), 1000);
  });

const selectionExists = () => {
  // check whether caret (cursor) is positioned anywhere in
  // the document

  if (typeof window.getSelection === 'undefined') {
    return false;
  }

  // window.getSelection() selects everything before the caret
  if (window.getSelection().rangeCount === 0) {
    return false;
  }

  return true;
};

export const makeSelection = () => {
  if (!selectionExists()) {
    return '';
  }

  // element.focus();
  const actualRange = window.getSelection().getRangeAt(0);
  const selectionRange = actualRange.cloneRange();

  // select everything before the caret
  selectionRange.selectNode(actualRange.startContainer);
  selectionRange.setEnd(actualRange.endContainer, actualRange.endOffset);

  return selectionRange;
};

export const getCaretMetaInfo = (element) => {
  let caretX = 0;
  let caretY = 0;
  let caretPosition = 0;

  if (!selectionExists()) {
    return { caretX, caretY, caretPosition };
  }

  const isInputElement =
    element.nodeName === 'TEXTAREA' || element.nodeName === 'INPUT';

  if (isInputElement) {
    return { caretX, caretY, caretPosition: element.selectionStart };
  }

  if (element.contentEditable) {
    // focus the parent and clone the range
    element.focus();
    const actualRange = window.getSelection().getRangeAt(0);

    // START get caret position
    // select everything before the caret
    const positionRange = actualRange.cloneRange();
    positionRange.selectNodeContents(element);
    positionRange.setEnd(actualRange.endContainer, actualRange.endOffset);
    caretPosition = positionRange.toString().length;
    // END get caret position

    // START get caret xy
    const xyRange = actualRange.cloneRange();
    // Collapse the range to the start, so there are not multiple chars selected
    xyRange.collapse(true);
    // getCientRects returns all the positioning information we need
    const rect = xyRange.getClientRects()[0];
    if (rect) {
      caretX = rect.left; // since the caret is only 1px wide, left == right
      caretY = rect.top; // top edge of the caret
    }
    // END get caret xy

    return { caretX, caretY, caretPosition };
  }
};

export const getChildNodesAsText = (element, { asNodes = true } = {}) => {
  // recursively get all child nodes and return them as an array

  let textNodes = [];

  if (element.hasChildNodes()) {
    element.childNodes.forEach((n) => {
      if (n.nodeType !== Node.TEXT_NODE) {
        textNodes = textNodes.concat(getChildNodesAsText(n));
      } else {
        textNodes.push(n);
      }
    });
  }

  if (asNodes) {
    return textNodes;
  } else {
    return textNodes.map((n) => n.data);
  }
};

export const setSelectionOffset = (elem, offset) => {
  const textNodes = getChildNodesAsText(elem);
  for (const n of textNodes) {
    if (n.textContent.length >= offset) {
      window.getSelection().setPosition(n, offset);
      break;
    } else {
      offset -= n.textContent.length;
    }
  }
};

export const castNodesToString = (element) => {
  // select everything before the caret and cast to plain string
  // count every tag and attribute

  if (!selectionExists()) {
    return;
  }

  element.focus();
  let nodeString = '';
  const range = window.getSelection().getRangeAt(0);

  const rangeCopy = range.cloneRange();
  rangeCopy.selectNodeContents(element);
  rangeCopy.setEnd(range.endContainer, range.endOffset);

  rangeCopy.cloneContents().childNodes.forEach((cn) => {
    // I expect only <a></a> tags and plain text

    if (cn.nodeType === Node.ELEMENT_NODE) {
      nodeString += cn.outerHTML;
    }
    if (cn.nodeType === Node.TEXT_NODE) {
      nodeString += cn.textContent;
    }
  });

  return nodeString;
};
