import { Component, Element, Event, EventEmitter, h, Host, Prop, State } from '@stencil/core';

@Component({
  tag: 'skyrocket-ai',
  styleUrl: 'skyrocket-ai.scss',
  shadow: true
})
export class SkyrocketAI {
  @Prop() text: string;
  @State() xPosition: number = 0;
  @State() unlocked: boolean = false;
  @State() percentage: number = 0;
  @Element() el: HTMLElement;

  @Event() unlockedChanged: EventEmitter<boolean>;
  @Event() percentageChanged: EventEmitter<number>;

  startX: number = 0;
  rangeWidth: number = 0;
  handlerWidth: number = 0;
  firePercentage: number = 0.85;
  isPointerDown: boolean = false;

  componentDidLoad() {
    const rangeElement = this.el.shadowRoot.querySelector('.range');
    const handlerElement = this.el.shadowRoot.querySelector('.handler');
    this.rangeWidth = rangeElement.getBoundingClientRect().width;
    this.handlerWidth = handlerElement.getBoundingClientRect().width;

    // Check if touch events are supported
    if (!('ontouchstart' in window)) {
      document.addEventListener('pointermove', this.handlePointerMove);
      document.addEventListener('pointerup', this.handlePointerEnd);
      document.addEventListener('pointerleave', this.handlePointerEnd);
      document.addEventListener('pointercancel', this.handlePointerEnd);
    }
  }

  componentWillUnload() {
    // Remove event listeners
    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('pointerup', this.handlePointerEnd);
    document.removeEventListener('pointerleave', this.handlePointerEnd);
    document.removeEventListener('pointercancel', this.handlePointerEnd);
  }

  private handlePointerStart = (event: TouchEvent | PointerEvent) => {
    event.preventDefault();

    this.el.shadowRoot.querySelector('.handler').classList.remove('transition');

    if (event instanceof TouchEvent) {
      this.startX = event.touches[0].clientX - this.xPosition;
    } else if (event instanceof PointerEvent) {
      this.isPointerDown = true;
      this.startX = event.clientX - this.xPosition;
    }
  };

  private handlePointerMove = (event: TouchEvent | PointerEvent) => {
    event.preventDefault();

    if (event instanceof PointerEvent && !this.isPointerDown) {
      return;
    }

    requestAnimationFrame(() => {
      let clientX: number;

      if (event instanceof TouchEvent) {
        clientX = event.touches[0].clientX;
      } else if (event instanceof PointerEvent) {
        clientX = event.clientX;
      }

      let newXPosition = clientX - this.startX;

      if (newXPosition < 0) {
        newXPosition = 0;
      } else if (newXPosition > this.rangeWidth - this.handlerWidth) {
        newXPosition = this.rangeWidth - this.handlerWidth;
      }

      this.xPosition = newXPosition;
      this.percentage = (this.xPosition / (this.rangeWidth - this.handlerWidth)) * 100;

      // Emit percentage change event
      this.percentageChanged.emit(this.percentage);

      if (newXPosition >= (this.rangeWidth - this.handlerWidth) * this.firePercentage) {
        if (!this.unlocked) {
          this.unlocked = true;
          this.unlockedChanged.emit(this.unlocked);  // Emit unlocked change event
        }
      } else {
        if (this.unlocked) {
          this.unlocked = false;
          this.unlockedChanged.emit(this.unlocked);  // Emit unlocked change event
        }
      }
    });
  };

  private handlePointerEnd = (event: TouchEvent | PointerEvent) => {
    if (event instanceof PointerEvent) {
      this.isPointerDown = false;
    }

    const handlerElement = this.el.shadowRoot.querySelector('.handler');
    handlerElement.classList.add('transition');

    if (this.xPosition >= (this.rangeWidth - this.handlerWidth) * this.firePercentage) {
      this.xPosition = this.rangeWidth - this.handlerWidth;
      this.percentage = 100;
    } else {
      this.xPosition = 0;
      this.percentage = 0;
    }

    // Emit percentage change event
    this.percentageChanged.emit(this.percentage);

    // Emit unlocked change event
    this.unlockedChanged.emit(this.unlocked);
  };

  private reset = () => {
    this.xPosition = 0;
    this.unlocked = false;
    this.percentage = 0;

    // Emit reset events
    this.unlockedChanged.emit(this.unlocked);
    this.percentageChanged.emit(this.percentage);
  };

  render() {
    const style = {
      transform: `translateX(${this.xPosition}px)`
    };

    return (
      <Host>
        <div class="range">
          <div class="handler"
            style={style}
            onTouchStart={this.handlePointerStart}
            onTouchMove={this.handlePointerMove}
            onTouchEnd={this.handlePointerEnd}
            onPointerDown={this.handlePointerStart}>
          </div>
        </div>
      </Host>
    );
  }
}