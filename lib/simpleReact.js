const TEXT_ELEMENT = 'TEXT_ELEMENT';

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(item => (typeof item === 'object' ? item : createTextElement(item)))
    }
  };
}

function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: []
    }
  };
}

function render(element, container) {
  // 创建真实dom节点
  const dom =
    element.type === TEXT_ELEMENT
      ? document.createTextNode('')
      : document.createElement(element.type);

  // 给dom添加属性
  Object.keys(element.props)
    .filter(key => key !== 'children')
    .forEach(key => {
      dom[key] = element.props[key];
    });

  element.props.children.forEach(item => render(item, dom));
  container.appendChild(dom);
}

const SimpleReact = {
  render,
  createElement
};
