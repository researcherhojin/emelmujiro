import React, { memo } from 'react';
import { Pause, Play } from 'lucide-react';

interface CarouselPauseButtonProps {
  playing: boolean;
  onToggle: () => void;
  labelPause: string;
  labelPlay: string;
}

const CarouselPauseButton: React.FC<CarouselPauseButtonProps> = memo(
  ({ playing, onToggle, labelPause, labelPlay }) => (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? labelPause : labelPlay}
      className="mx-auto mt-4 sm:mt-6 inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:focus-visible:outline-white"
    >
      {playing ? (
        <Pause className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Play className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  )
);

CarouselPauseButton.displayName = 'CarouselPauseButton';

export default CarouselPauseButton;
