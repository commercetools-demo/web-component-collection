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
          
          /* CSS Variables for styling */
          --selector-button-padding: 8px 16px;
          --selector-button-border: 1px solid #ccc;
          --selector-button-border-radius: 4px;
          --selector-button-background: #f5f5f5;
          --selector-button-color: inherit;
          --selector-button-font-family: system-ui, -apple-system, sans-serif;
          --selector-button-font-size: inherit;
          --selector-button-font-weight: normal;
          --selector-button-transition: all 0.2s;
          
          --selector-button-hover-background: #e9e9e9;
          --selector-button-hover-color: inherit;
          --selector-button-hover-border-color: #ccc;
          
          --selector-button-selected-background: #4a90e2;
          --selector-button-selected-color: white;
          --selector-button-selected-border-color: #3a80d2;
          
          --selector-button-disabled-opacity: 0.5;
        }
        
        .selector-button {
          padding: var(--selector-button-padding);
          border: var(--selector-button-border);
          border-radius: var(--selector-button-border-radius);
          background: var(--selector-button-background);
          color: var(--selector-button-color);
          font-family: var(--selector-button-font-family);
          font-size: var(--selector-button-font-size);
          font-weight: var(--selector-button-font-weight);
          cursor: pointer;
          transition: var(--selector-button-transition);
        }
        
        .selector-button:hover {
          background: var(--selector-button-hover-background);
          color: var(--selector-button-hover-color);
          border-color: var(--selector-button-hover-border-color);
        }
        
        .selector-button.selected {
          background: var(--selector-button-selected-background);
          color: var(--selector-button-selected-color);
          border-color: var(--selector-button-selected-border-color);
        }
        
        .selector-button.disabled {
          opacity: var(--selector-button-disabled-opacity);
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