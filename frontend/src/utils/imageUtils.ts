import React from 'react';

/** Prevent right-click save and drag on protected images */
export const preventImageAction = (e: React.MouseEvent | React.DragEvent) => {
  e.preventDefault();
};
