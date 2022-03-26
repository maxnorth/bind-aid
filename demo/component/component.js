const templateHtml = `
  <template data-bind-scope="hey" data-bind-render-for="i of [{}]">
    <h3 data-bind-property="innerText: hey.value"></h3>
  </template>

  <style>
    * {
      color: red;
    }
  </style>
`

customElements.define('some-thing', class extends HTMLElement {
  #scope;
  
  constructor() {
    super()
    let shadowRoot = this.attachShadow({mode: 'closed'})
    bind(shadowRoot)
    shadowRoot.innerHTML = templateHtml
    let bindTemplate = shadowRoot.querySelector('template[data-bind-scope]')
    this.#scope = bindTemplate.scope = Observable({
      value: 'whaaat'
    })
  }

  set bleh(value) {
    this.#scope.value = value
  }
})