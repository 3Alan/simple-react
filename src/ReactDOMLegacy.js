import { ElementType } from './ReactElement.js';

function setDomAttribute(dom, props) {
  const isProperty = key => key !== 'children';
  Object.keys(props)
    .filter(isProperty)
    .forEach(propName => {
      dom[propName] = props[propName];
    });
}

function render(element, container) {
  // 创建DOM节点
  const dom =
    element.type === ElementType.text
      ? document.createTextNode('')
      : document.createElement(element.type);
  setDomAttribute(dom, element.props);

  // 遍历子元素，无法中断，所以引入了Fiber
  element.props.children.forEach(child => {
    render(child, dom);
  });

  container.appendChild(dom);
}

const ReactDOM = { render };

export default ReactDOM;
