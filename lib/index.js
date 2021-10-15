/** @jsx SimpleReact.createElement */
const element = (
  <div>
    <h1>Hello React</h1>
  </div>
);

const container = document.getElementById('root');
SimpleReact.render(element, container);
