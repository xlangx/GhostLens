interface TouchPoint {
  x: number;
  y: number;
}

interface GestureState {
  isDragging: boolean;
  isPinching: boolean;
  isRotating: boolean;
  lastTouch: TouchPoint | null;
  initialDistance: number;
  initialAngle: number;
  initialScale: number;
  initialRotation: number;
}

export class GestureHandler {
  private state: GestureState = {
    isDragging: false,
    isPinching: false,
    isRotating: false,
    lastTouch: null,
    initialDistance: 0,
    initialAngle: 0,
    initialScale: 1,
    initialRotation: 0
  };

  private onTransform: (transform: {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
  }) => void;

  constructor(
    element: HTMLElement,
    onTransform: (transform: { x?: number; y?: number; scale?: number; rotation?: number }) => void
  ) {
    this.onTransform = onTransform;
    this.attachListeners(element);
  }

  private attachListeners(element: HTMLElement) {
    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }

  private handleTouchStart(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 1) {
      // Single touch - start dragging
      this.state.isDragging = true;
      this.state.lastTouch = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2) {
      // Two touches - start pinch/rotate
      this.state.isDragging = false;
      this.state.isPinching = true;
      this.state.isRotating = true;

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      this.state.initialDistance = this.getDistance(touch1, touch2);
      this.state.initialAngle = this.getAngle(touch1, touch2);
    }
  }

  private handleTouchMove(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 1 && this.state.isDragging && this.state.lastTouch) {
      // Single touch dragging
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.state.lastTouch.x;
      const deltaY = touch.clientY - this.state.lastTouch.y;

      this.onTransform({ x: deltaX, y: deltaY });

      this.state.lastTouch = {
        x: touch.clientX,
        y: touch.clientY
      };
    } else if (e.touches.length === 2 && (this.state.isPinching || this.state.isRotating)) {
      // Two touch pinch/rotate
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      if (this.state.isPinching) {
        const currentDistance = this.getDistance(touch1, touch2);
        const scaleChange = currentDistance / this.state.initialDistance;
        this.onTransform({ scale: scaleChange });
      }

      if (this.state.isRotating) {
        const currentAngle = this.getAngle(touch1, touch2);
        const rotationChange = currentAngle - this.state.initialAngle;
        this.onTransform({ rotation: rotationChange * (180 / Math.PI) });
      }
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      // All touches ended
      this.state.isDragging = false;
      this.state.isPinching = false;
      this.state.isRotating = false;
      this.state.lastTouch = null;
    } else if (e.touches.length === 1) {
      // One touch remaining
      this.state.isPinching = false;
      this.state.isRotating = false;
      
      if (!this.state.isDragging) {
        this.state.isDragging = true;
        this.state.lastTouch = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    }
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getAngle(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.atan2(dy, dx);
  }

  public destroy() {
    // Remove event listeners if needed
  }
}
