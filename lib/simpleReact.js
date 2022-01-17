const TEXT_ELEMENT = 'TEXT_ELEMENT';

const isProperty = key => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);
const isEvent = key => key.startsWith('on');

// 由于渲染过程可以被单端，所以有一个变量来保存当前正在执行的工作单元
let workInProgressRoot = null;
let nextUnitOfWork = null;
// 用来保存最近commit的fiber节点
let currentRoot = null;
// 需要进行删除操作的fiber
let deletions = null;

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
  workInProgressRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  };

  deletions = [];
  nextUnitOfWork = workInProgressRoot;
}

function createDom(fiber) {
  const dom =
    fiber.type === TEXT_ELEMENT ? document.createTextNode('') : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

/**
 * 执行当前fiber单元，并返回下一个执行单元
 * @param {*} fiber
 * @returns
 */
function performUnitOfWork(fiber) {
  // 创建dom赋值给fiber.dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  // 返回下一个工作单元
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

/**
 * commit阶段：当完成了所有工作单元时，即没有查找到下一个工作单元，将整个fiber树提交给dom
 */
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(workInProgressRoot.child);
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
}

/**
 * 向上递归处理所有dom节点
 * @param {*} fiber
 * @returns
 */
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function reconcileChildren(workInProgressFiber, elements) {
  let index = 0;
  let oldFiber = workInProgressFiber.alternate && workInProgressFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber !== null) {
    const element = elements[index];

    let newFiber = null;

    // diff比较
    const sameType = oldFiber && element && element.type === oldFiber.type;
    if (sameType) {
      // 如果type相同，复用dom节点，更新props
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: workInProgressFiber,
        alternate: oldFiber,
        // 打上更新标签
        effectTag: 'UPDATE'
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: workInProgressFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      workInProgressFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

const SimpleReact = {
  render,
  createElement
};
