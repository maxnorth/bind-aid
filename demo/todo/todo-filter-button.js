customElements.define('todo-filter-button', class extends HTMLElement {
  #scope;
  
  set isPressed(value) { this.#scope.isPressed = value }
  get isPressed() { return this.#scope.isPressed }
  
  set filterName(value) { this.#scope.filterName = value }
  get filterName() { return this.#scope.filterName }

  constructor() {
    super()

    let shadowRoot = this.attachShadow({ mode: 'closed' })

    this.#scope = Observable({
      isPressed: false,
      filterName: undefined
    })

    shadowRoot.innerHTML = /*html*/`
      <template data-bind-scope="button" data-bind-render>
        <button
          type="button"
          class="btn toggle-btn"
          data-bind-property="'aria-pressed': button.isPressed"
        >
          <span class="visually-hidden">Show </span>
          <span data-bind-property="innerText: button.filterName"></span>
          <span class="visually-hidden"> tasks</span>
        </button>
      </template>

      ${styleTag()}
    `

    shadowRoot.querySelector('template[data-bind-scope]').scope = this.#scope
    bind(shadowRoot)
  }
})