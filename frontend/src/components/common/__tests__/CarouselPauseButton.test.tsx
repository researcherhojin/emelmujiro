import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarouselPauseButton from '../CarouselPauseButton';

const setup = (playing: boolean) => {
  const onToggle = vi.fn();
  render(
    <CarouselPauseButton
      playing={playing}
      onToggle={onToggle}
      labelPause="pause label"
      labelPlay="play label"
    />
  );
  return onToggle;
};

describe('CarouselPauseButton', () => {
  it('offers pause while playing', () => {
    setup(true);
    expect(screen.getByRole('button', { name: 'pause label' })).toHaveAttribute('type', 'button');
  });

  it('offers play while paused', () => {
    setup(false);
    expect(screen.getByRole('button', { name: 'play label' })).toBeInTheDocument();
  });

  it('calls onToggle on click', () => {
    const onToggle = setup(true);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('has displayName set', () => {
    expect(CarouselPauseButton.displayName).toBe('CarouselPauseButton');
  });
});
