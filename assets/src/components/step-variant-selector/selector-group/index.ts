import '../selector-button';

interface SelectorOption {
  value: any;
  selected: boolean;
  disabled: boolean;
}

class SelectorGroup extends HTMLElement {
  private selectorName: string = '';
  private selectorLabel: string = '';
  private options: SelectorOption[] = [];
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['selector-name', 'selector-label', 'options'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'selector-name':
          this.selectorName = newValue;
          break;
        case 'options':
          try {
            this.options = JSON.parse(newValue);
          } catch (e) {
            console.error('Error parsing options attribute', e);
            this.options = [];
          }
          break;
        case 'selector-label':
          this.selectorLabel = newValue;
          break;
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.addEventListener('selector-click', this.handleSelectorClick as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener('selector-click', this.handleSelectorClick as EventListener);
  }

  private handleSelectorClick(e: Event) {
    const customEvent = e as CustomEvent;
    this.dispatchEvent(new CustomEvent('group-selection-changed', {
      bubbles: true,
      composed: true,
      detail: {
        selectorName: this.selectorName,
        value: customEvent.detail.value
      }
    }));
  }

  private render() {
    const styles = `
      <style>
        :host {
          display: block;
          margin-bottom: var(--selector-group-margin-bottom, 16px);
          font-family: var(--selector-group-font-family, system-ui, -apple-system, sans-serif);
          
          /* CSS Variables for styling */
          --selector-group-margin-bottom: 16px;
          --selector-group-font-family: system-ui, -apple-system, sans-serif;
          
          --selector-group-label-font-weight: bold;
          --selector-group-label-margin-bottom: 8px;
          --selector-group-label-text-transform: capitalize;
          --selector-group-label-color: inherit;
          --selector-group-label-font-size: inherit;
          
          --selector-buttons-display: flex;
          --selector-buttons-flex-wrap: wrap;
          --selector-buttons-gap: 8px;
          --selector-buttons-justify-content: flex-start;
          --selector-buttons-align-items: center;
        }
        
        .selector-group-label {
          font-weight: var(--selector-group-label-font-weight);
          margin-bottom: var(--selector-group-label-margin-bottom);
          text-transform: var(--selector-group-label-text-transform);
          color: var(--selector-group-label-color);
          font-size: var(--selector-group-label-font-size);
        }
        
        .selector-buttons {
          display: var(--selector-buttons-display);
          flex-wrap: var(--selector-buttons-flex-wrap);
          gap: var(--selector-buttons-gap);
          justify-content: var(--selector-buttons-justify-content);
          align-items: var(--selector-buttons-align-items);
        }
      </style>
    `;

    const buttonsHtml = this.options.map(option => {
      return `
        <selector-button 
          selector-name="${this.selectorName}"
          value='${JSON.stringify(option.value)}'
          ${option.selected ? 'selected' : ''}
          ${option.disabled ? 'disabled' : ''}>
        </selector-button>
      `;
    }).join('');

    this.shadow.innerHTML = `
      ${styles}
      <div class="selector-group">
        <div class="selector-group-label">${this.selectorLabel}</div>
        <div class="selector-buttons">
          ${buttonsHtml}
        </div>
      </div>
    `;
  }
}

customElements.define('selector-group', SelectorGroup);

export default SelectorGroup; 