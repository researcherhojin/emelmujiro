// Mock framer-motion
const motion = {
  div: ({ children, ...props }) => <div {...props}>{children}</div>,
  section: ({ children, ...props }) => <section {...props}>{children}</section>,
  button: ({ children, ...props }) => <button {...props}>{children}</button>,
  span: ({ children, ...props }) => <span {...props}>{children}</span>,
  h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
  h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
  p: ({ children, ...props }) => <p {...props}>{children}</p>,
  img: props => <img alt="" {...props} />,
  a: ({ children, ...props }) => <a {...props}>{children}</a>,
  article: ({ children, ...props }) => <article {...props}>{children}</article>,
  ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
  li: ({ children, ...props }) => <li {...props}>{children}</li>,
};

const AnimatePresence = ({ children }) => children;

module.exports = {
  motion,
  AnimatePresence,
};
