import { marked } from 'marked';
import { FileItem } from '../types';

export const getParentNode = (parentClassName: string, node: EventTarget | null) => {
  let currentNode: Node | null = node as Node;
  while (currentNode !== null) {
    const element = currentNode as Element
    if (element.classList.contains(parentClassName)) {
      return currentNode
    }
    currentNode = currentNode.parentNode
  }
  return false
}

export const getPreviewRender = (markedOptions: marked.MarkedOptions = {}) => {
  return (text: string) => {
    // Set options
    marked.setOptions(markedOptions)

    // Convert the markdown to HTML
    var htmlText = marked.parse(text)

    // Edit the HTML anchors to add 'target="_blank"' by default.
    htmlText = addAnchorTargetBlank(htmlText);

    // Remove list-style when rendering checkboxes
    htmlText = removeListStyleWhenCheckbox(htmlText);

    return htmlText;
  }
}

export const objToArr = <T> (obj: { [key: string]: T }) => {
  return Object.keys(obj).map(key => obj[key] as T)
}

export const debounce = (func: Function, wait: number = 100) => {
  let timeout: NodeJS.Timeout | null = null
  let result: any

  const debounced = function (this: any, ...args: any[]) {
    let context = this
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      return
    } else {
      timeout = setTimeout(() => {
        result = func.apply(context, args)
        if (timeout !== null) {
          clearTimeout(timeout)
          timeout = null
        }
      }, wait)
      return result
    }
  }

  return debounced
}

const anchorToExternalRegex = new RegExp(/(<a.*?https?:\/\/.*?[^a]>)+?/g);

function addAnchorTargetBlank (htmlText: string) {
  var match;
  while ((match = anchorToExternalRegex.exec(htmlText)) !== null) {
    // With only one capture group in the RegExp, we can safely take the first index from the match.
    var linkString = match[0];

    if (linkString.indexOf('target=') === -1) {
      var fixedLinkString = linkString.replace(/>$/, ' target="_blank">');
      htmlText = htmlText.replace(linkString, fixedLinkString);
    }
  }
  return htmlText;
}

function removeListStyleWhenCheckbox (htmlText: string) {

  var parser = new DOMParser();
  var htmlDoc = parser.parseFromString(htmlText, 'text/html');
  var listItems = htmlDoc.getElementsByTagName('li');

  for (var i = 0; i < listItems.length; i++) {
    var listItem = listItems[i];

    for (var j = 0; j < listItem.children.length; j++) {
      var listItemChild = listItem.children[j];

      if (listItemChild instanceof HTMLInputElement && listItemChild.type === 'checkbox') {
        // From Github: margin: 0 .2em .25em -1.6em;
        listItem.style.marginLeft = '-1.5em';
        listItem.style.listStyleType = 'none';
      }
    }
  }

  return htmlDoc.documentElement.innerHTML;
}