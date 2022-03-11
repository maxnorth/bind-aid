const templateHtml = `
  <template data-bind-scope="hey" data-bind-render>
    <h3 data-bind-property="innerText: hey.value"></h3>
  </template>

  <style>
    
  </style>
`

customElements.define('some-thing', class extends HTMLElement {
  #scope;

  constructor() {
    super()
    const [shadowRoot, template] = this.#initTemplate()
    this.#scope = template.scope = ReactiveProxy(shadowRoot, {
      value: 'whaaat'
    })
  }

  #initTemplate() {
    let shadowRoot = this.attachShadow({mode: 'closed'})
    shadowRoot.innerHTML = templateHtml
    return [shadowRoot, shadowRoot.children[0]]
  }

  set bleh(value) {
    this.#scope.value = value
  }
})