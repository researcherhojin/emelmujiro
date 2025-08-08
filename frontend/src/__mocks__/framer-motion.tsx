import React from 'react';

// Define types for motion props
type AnimationProps = Record<string, unknown>;
type TransitionProps = Record<string, unknown>;
type ViewportProps = Record<string, unknown>;
type DragProps = boolean | 'x' | 'y';
type DragConstraints = Record<string, unknown>;

interface MotionProps {
  whileInView?: AnimationProps;
  whileHover?: AnimationProps;
  whileTap?: AnimationProps;
  whileDrag?: AnimationProps;
  whileFocus?: AnimationProps;
  animate?: AnimationProps;
  initial?: AnimationProps | boolean;
  exit?: AnimationProps;
  transition?: TransitionProps;
  variants?: Record<string, AnimationProps>;
  custom?: unknown;
  inherit?: boolean;
  layout?: boolean | string;
  layoutId?: string;
  layoutDependency?: unknown;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  onUpdate?: (latest: AnimationProps) => void;
  onDragStart?: (event: MouseEvent | TouchEvent | PointerEvent) => void;
  onDragEnd?: (event: MouseEvent | TouchEvent | PointerEvent) => void;
  onDrag?: (event: MouseEvent | TouchEvent | PointerEvent) => void;
  onDirectionLock?: (axis: 'x' | 'y') => void;
  onDragTransitionEnd?: () => void;
  drag?: DragProps;
  dragControls?: unknown;
  dragListener?: boolean;
  dragConstraints?: DragConstraints;
  dragDirectionLock?: boolean;
  dragElastic?: boolean | number;
  dragMomentum?: boolean;
  dragPropagation?: boolean;
  dragTransition?: TransitionProps;
  transformTemplate?: (transform: string) => string;
  style?: React.CSSProperties;
  onViewportEnter?: () => void;
  onViewportLeave?: () => void;
  viewport?: ViewportProps;
  children?: React.ReactNode;
  [key: string]: unknown;
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
