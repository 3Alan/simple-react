# simple-react

## 涉及知识点
- [requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback) 传入的函数会在事件循环空闲时被调用，react自己实现了一个包来实现同样的效果[scheduler](https://github.com/facebook/react/tree/main/packages/scheduler)。


## Fiber
构建Fiber树，这种数据结构方便找到下一个工作单元，每个Fiber都被当做是一个工作单元。
当结束了当前工作单元时，会将该child作为下一个工作单元，如果没有child，会将sibling作为下一个工作单元。如果既没有child也没有sibling，那么将会寻找uncle节点，即sibling的parent节点，如果父节点没有sibling那么将会一直往上寻找直到到达根节点，这是意味着完成了渲染的所有工作。
![Fiber Tree](https://pomb.us/static/c1105e4f7fc7292d91c78caee258d20d/ac667/fiber2.png)