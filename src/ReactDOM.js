import { ElementType } from './ReactElement.js';

// 下一个工作单元
let nextUnitOfWork = null;

// 任务循环
function workLoop(deadline) {
  let shouldYield = false;

  // 当还有下一执行单元并且浏览器还有空闲时间时，否则跳出while再像浏览器请求空闲时间
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

// 浏览器调度
requestIdleCallback(workLoop);

// 执行当前工作单元并返回下一工作单元
function performUnitOfWork(nextUnitOfWork) {}

function setDomAttribute(dom, props) {
  const isProperty = key => key !== 'children';
  Object.keys(props)
    .filter(isProperty)
    .forEach(propName => {
      dom[propName] = props[propName];
    });
}

function createDom(fiber) {
  // 创建DOM节点
  const dom =
    fiber.type === ElementType.text
      ? document.createTextNode('')
      : document.createElement(fiber.type);
  setDomAttribute(dom, fiber.props);

  // 遍历子元素
  fiber.props.children.forEach(child => {
    render(child, dom);
  });

  return dom;
}

function render(element, container) {
  // FiberRoot?
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    }
  };
}

const ReactDOM = { render };

export default ReactDOM;
