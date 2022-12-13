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