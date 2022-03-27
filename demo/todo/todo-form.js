customElements.define('todo-form', class extends HTMLElement {
  #scope;

  addTask;

  constructor() {
    super()

    let shadowRoot = this.attachShadow({ mode: 'closed' })

    let scope = this.#scope = Observable({
      name: "",
      handleSubmit: (e) => {
        e.preventDefault()
        if (!scope.name.trim()) {
          return
        }
        this.addTask?.(scope.name)
        scope.name = ""
      }
    })

    shadowRoot.innerHTML = /*html*/`
      <template data-bind-scope="form" data-bind-render>
        <form data-bind-event="submit: form.handleSubmit">
          <h2 class="label-wrapper">
            <label for="new-todo-input" class="label__lg">
              What needs to be done?
            </label>
          </h2>
          <input
            type="text"
            id="new-todo-input"
            class="input input__lg"
            name="text"
            autocomplete="off"
            data-bind-property="value: form.name"
            data-bind-event="change(e) { form.name = e.target.value }"
          />
          <button type="submit" class="btn btn__primary btn__lg">
            Add
          </button>
        </form>
      </template>

      ${styleTag()}
    `

    shadowRoot.querySelector('template[data-bind-scope]').scope = this.#scope
    bind(shadowRoot)
  }
})