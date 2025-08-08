import React from 'react';

// Define types for motion props
interface MotionProps {
  whileInView?: any;
  whileHover?: any;
  whileTap?: any;
  whileDrag?: any;
  whileFocus?: any;
  animate?: any;
  initial?: any;
  exit?: any;
  transition?: any;
  variants?: any;
  custom?: any;
  inherit?: any;
  layout?: any;
  layoutId?: any;
  layoutDependency?: any;
  onAnimationStart?: any;
  onAnimationComplete?: any;
  onUpdate?: any;
  onDragStart?: any;
  onDragEnd?: any;
  onDrag?: any;
  onDirectionLock?: any;
  onDragTransitionEnd?: any;
  drag?: any;
  dragControls?: any;
  dragListener?: any;
  dragConstraints?: any;
  dragDirectionLock?: any;
  dragElastic?: any;
  dragMomentum?: any;
  dragPropagation?: any;
  dragTransition?: any;
  transformTemplate?: any;
  style?: React.CSSProperties;
  onViewportEnter?: any;
  onViewportLeave?: any;
  viewport?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

// Filter out motion-specific props to avoid React warnings
const filterMotionProps = (props: MotionProps) => {
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

export const motion = {
  div: ({ children, ...props }: MotionProps) => <div {...filterMotionProps(props)}>{children}</div>,
  section: ({ children, ...props }: MotionProps) => (
    <section {...filterMotionProps(props)}>{children}</section>
  ),
  button: ({ children, ...props }: MotionProps) => (
    <button {...filterMotionProps(props)}>{children}</button>
  ),
  span: ({ children, ...props }: MotionProps) => (
    <span {...filterMotionProps(props)}>{children}</span>
  ),
  h1: ({ children, ...props }: MotionProps) => <h1 {...filterMotionProps(props)}>{children}</h1>,
  h2: ({ children, ...props }: MotionProps) => <h2 {...filterMotionProps(props)}>{children}</h2>,
  h3: ({ children, ...props }: MotionProps) => <h3 {...filterMotionProps(props)}>{children}</h3>,
  p: ({ children, ...props }: MotionProps) => <p {...filterMotionProps(props)}>{children}</p>,
  img: (props: MotionProps) => <img alt="" {...filterMotionProps(props)} />,
  a: ({ children, ...props }: MotionProps) => <a {...filterMotionProps(props)}>{children}</a>,
  article: ({ children, ...props }: MotionProps) => (
    <article {...filterMotionProps(props)}>{children}</article>
  ),
  ul: ({ children, ...props }: MotionProps) => <ul {...filterMotionProps(props)}>{children}</ul>,
  li: ({ children, ...props }: MotionProps) => <li {...filterMotionProps(props)}>{children}</li>,
};

export const AnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
