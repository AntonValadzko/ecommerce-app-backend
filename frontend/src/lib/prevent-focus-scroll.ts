import type { MouseEvent } from 'react';

/** Stops the browser from scrolling focused controls into view (e.g. sidebar checkboxes). */
export function preventFocusScroll(event: MouseEvent) {
  event.preventDefault();
}
