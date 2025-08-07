// Mock framer-motion
// Filter out motion-specific props to avoid React warnings
const filterMotionProps = props => {
  const {
    whileInView,
    whileHover,
    whileTap,
    whileDrag,
    whileFocus,
    animate,
    initial,
    exit,
    transition,
    variants,
    custom,
    inherit,
    layout,
    layoutId,
    layoutDependency,
    onAnimationStart,
    onAnimationComplete,
    onUpdate,
    onDragStart,
    onDragEnd,
    onDrag,
    onDirectionLock,
    onDragTransitionEnd,
    drag,
    dragControls,
    dragListener,
    dragConstraints,
    dragDirectionLock,
    dragElastic,
    dragMomentum,
    dragPropagation,
    dragTransition,
    transformTemplate,
    style,
    onViewportEnter,
    onViewportLeave,
    viewport,
    ...filteredProps
  } = props;
  return filteredProps;
};

const motion = {
  div: ({ children, ...props }) => <div {...filterMotionProps(props)}>{children}</div>,
  section: ({ children, ...props }) => <section {...filterMotionProps(props)}>{children}</section>,
  button: ({ children, ...props }) => <button {...filterMotionProps(props)}>{children}</button>,
  span: ({ children, ...props }) => <span {...filterMotionProps(props)}>{children}</span>,
  h1: ({ children, ...props }) => <h1 {...filterMotionProps(props)}>{children}</h1>,
  h2: ({ children, ...props }) => <h2 {...filterMotionProps(props)}>{children}</h2>,
  h3: ({ children, ...props }) => <h3 {...filterMotionProps(props)}>{children}</h3>,
  p: ({ children, ...props }) => <p {...filterMotionProps(props)}>{children}</p>,
  img: props => <img alt="" {...filterMotionProps(props)} />,
  a: ({ children, ...props }) => <a {...filterMotionProps(props)}>{children}</a>,
  article: ({ children, ...props }) => <article {...filterMotionProps(props)}>{children}</article>,
  ul: ({ children, ...props }) => <ul {...filterMotionProps(props)}>{children}</ul>,
  li: ({ children, ...props }) => <li {...filterMotionProps(props)}>{children}</li>,
};

const AnimatePresence = ({ children }) => children;

module.exports = {
  motion,
  AnimatePresence,
};
