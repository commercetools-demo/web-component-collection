class SelectorButton extends HTMLElement {
  private value: any;
  private selectorName: string = '';
  private selected: boolean = false;
  private disabled: boolean = false;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['selector-name', 'value', 'selected', 'disabled'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'selector-name':
          this.selectorName = newValue;
          break;
        case 'value':
          try {
            this.value = JSON.parse(newValue);
          } catch (e) {
            console.error('Error parsing value attribute', e);
            this.value = newValue;
          }
          break;
        case 'selected':
          this.selected = newValue !== null && newValue !== 'false';
          break;
        case 'disabled':
          this.disabled = newValue !== null && newValue !== 'false';
          break;
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.addEventListener('click', this.handleClick.bind(this));
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick.bind(this));
  }

  private handleClick() {
    if (this.disabled) return;
    
    this.dispatchEvent(new CustomEvent('selector-click', {
      bubbles: true,
      composed: true,
      detail: {
        selectorName: this.selectorName,
        value: this.value
      }
    }));
  }

  private render() {
    const displayValue = typeof this.value === 'object' ? this.value.label ? this.value.label : JSON.stringify(this.value) : this.value;
    
    const styles = `
      <style>
        :host {
          display: inline-block;
          
          /* CSS Variables for styling - only use fallback values, don't define them here */
          /* This allows the variables to be set from outside */
        }
        
        .selector-button {
          padding: var(--selector-button-padding, 8px 16px);
          border: var(--selector-button-border, 1px solid #ccc);
          border-radius: var(--selector-button-border-radius, 4px);
          background: var(--selector-button-background, #f5f5f5);
          color: var(--selector-button-color, inherit);
          font-family: var(--selector-button-font-family, system-ui, -apple-system, sans-serif);
          font-size: var(--selector-button-font-size, inherit);
          font-weight: var(--selector-button-font-weight, normal);
          cursor: pointer;
          transition: var(--selector-button-transition, all 0.2s);
        }
        
        .selector-button:hover {
          background: var(--selector-button-hover-background, #e9e9e9);
          color: var(--selector-button-hover-color, inherit);
          border-color: var(--selector-button-hover-border-color, #ccc);
        }
        
        .selector-button.selected {
          background: var(--selector-button-selected-background, #4a90e2);
          color: var(--selector-button-selected-color, white);
          border-color: var(--selector-button-selected-border-color, #3a80d2);
        }
        
        .selector-button.disabled {
          opacity: var(--selector-button-disabled-opacity, 0.5);
          cursor: not-allowed;
        }
      </style>
    `;

    const buttonClass = `selector-button ${this.selected ? 'selected' : ''} ${this.disabled ? 'disabled' : ''}`;

    this.shadow.innerHTML = `
      ${styles}
      <button class="${buttonClass}" ${this.disabled ? 'disabled' : ''}>
        ${displayValue}
      </button>
    `;
  }
}

customElements.define('selector-button', SelectorButton);

export default SelectorButton; 