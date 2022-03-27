customElements.define('hello-world', class extends HTMLElement { 
  #scope;
  
  constructor() {
    super()
    
    let shadowRoot = this.attachShadow({mode: 'closed'})

    this.#scope = Observable({
      greeting: 'Hello world!!',
      doThing: (a) => { console.log(a, this.#scope.greeting) }
    })

    shadowRoot.innerHTML = /*html*/`
      <template data-bind-scope="helloWorld" data-bind-render>
        <h3 data-bind-property="innerText: helloWorld.greeting"></h3>
        <button type="button" data-bind-event="click() { console.log(helloWorld.greeting) }">
          Click Me
        </button>
      </template>
    
      <style>
        * {
          color: blue;
        }
      </style>
    `
    
    shadowRoot.querySelector('template[data-bind-scope]').scope = this.#scope
    bind(shadowRoot)
  }

  set greeting(value) { this.#scope.greeting = value || 'Hello world!!' }
  get greeting() { return this.#scope.greeting }
})
