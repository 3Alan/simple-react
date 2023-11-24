function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        if (typeof child === 'string') {
          return ReactTextElement(child);
        } else {
          return child;
        }
      })
    }
  };
}

function ReactTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}

const ElementType = {
  text: 'TEXT_ELEMENT'
};

export { createElement, ElementType };
