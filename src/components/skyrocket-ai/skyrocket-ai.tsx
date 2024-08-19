import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'skyrocket-ai',
  styleUrl: 'skyrocket-ai.scss',
  shadow: true
})
export class SkyrocketAI {
  @Prop() text: string

 
  render() {
    return (
      <div class="skyrocket-container">
        {/* <div class="text">{ this.text }</div> */}
        <div class="handler"></div>
      </div>
    );
  }
}