// Mock framer-motion
// Filter out motion-specific props to avoid React warnings
const filterMotionProps = props => {
  const {
    whileInView: _whileInView,
    whileHover: _whileHover,
    whileTap: _whileTap,
    whileDrag: _whileDrag,
    whileFocus: _whileFocus,
    animate: _animate,
    initial: _initial,
    exit: _exit,
    transition: _transition,
    variants: _variants,
    custom: _custom,
    inherit: _inherit,
    layout: _layout,
    layoutId: _layoutId,
    layoutDependency: _layoutDependency,
    onAnimationStart: _onAnimationStart,
    onAnimationComplete: _onAnimationComplete,
    onUpdate: _onUpdate,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    onDrag: _onDrag,
    onDirectionLock: _onDirectionLock,
    onDragTransitionEnd: _onDragTransitionEnd,
    drag: _drag,
    dragControls: _dragControls,
    dragListener: _dragListener,
    dragConstraints: _dragConstraints,
    dragDirectionLock: _dragDirectionLock,
    dragElastic: _dragElastic,
    dragMomentum: _dragMomentum,
    dragPropagation: _dragPropagation,
    dragTransition: _dragTransition,
    transformTemplate: _transformTemplate,
    style,
    onViewportEnter: _onViewportEnter,
    onViewportLeave: _onViewportLeave,
    viewport: _viewport,
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
