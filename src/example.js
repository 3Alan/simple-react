import ReactDOM from './ReactDom.js';
import { createElement } from './ReactElement.js';

/** @jsx createElement */
const element = (
  <div>
    <h1 style="color: red">Hello React</h1>
    <h2>Good</h2>
    <ul>
      <li>1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  </div>
);

const root = document.querySelector('#root');

ReactDOM.render(element, root);
