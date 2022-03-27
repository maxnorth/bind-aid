customElements.define('todo-item', class extends HTMLElement {
  #scope;

  set isEditing(value) { this.#scope.isEditing = value }
  get isEditing() { return this.#scope.isEditing }

  set name(value) { this.#scope.name = value }
  get name() { return this.#scope.name }
  
  set id(value) { this.#scope.id = value }
  get id() { return this.#scope.id }
  
  constructor() {
    super()

    let shadowRoot = this.attachShadow({ mode: 'closed' })

    let scope = this.#scope = Observable({
      isEditing: false,
      name: '',
      newName: '',
      handleSubmit(e) {
        e.preventDefault();
        if (!scope.newName.trim()) {
          return;
        }
        scope.emit('editTask', { name: scope.newName })
        scope.newName = ""
        scope.isEditing = false
      },
      emit: (eventName, detail) => {
        this.dispatchEvent(new CustomEvent(eventName, { detail }))
      }
    })

    shadowRoot.innerHTML = /*html*/`
      <template data-bind-scope="item" data-bind-render>
        <li class="todo">
          <template data-bind-render-if="item.isEditing">
            <form class="stack-small" data-bind-event="submit: item.handleSubmit">
              <div class="form-group">
                <label class="todo-label" data-bind-attribute="for: item.id">
                  New name for <span data-bind-property="innerText: item.name"></span>
                </label>
                <input
                  class="todo-text"
                  type="text"
                  data-bind-event="change(e) { item.newName = e.target.value }"
                  data-bind-attribute="id: item.id"
                  data-bind-property="value: item.newName"
                />
              </div>
              <div class="btn-group">
                <button
                  type="button"
                  class="btn todo-cancel"
                  data-bind-event="click() { item.isEditing = false }"
                >
                  Cancel
                  <span class="visually-hidden">
                    renaming 
                    <span data-bind-property="innerText: item.name"></span>
                  </span>
                </button>
                <button type="submit" class="btn btn__primary todo-edit">
                  Save
                  <span class="visually-hidden">
                    new name for 
                    <span data-bind-property="innerText: item.name"></span>
                  </span>
                </button>
              </div>
            </form>
          </template>
          <template data-bind-render-if="!item.isEditing">
            <div class="stack-small">
              <div class="c-cb">
                <input
                  type="checkbox"
                  data-bind-event="change() { item.emit('toggleTaskCompleted') }"
                  data-bind-attribute="id: item.id"
                  data-bind-property="checked: item.completed"
                />
                <label 
                  class="todo-label" 
                  data-bind-attribute="for: item.id"
                  data-bind-property="innerText: item.name"></label>
              </div>
              <div class="btn-group">
                <button
                  type="button"
                  class="btn"
                  data-bind-event="click() { item.isEditing = true, item.newName = item.name }"
                  >
                    Edit <span class="visually-hidden" data-bind-property="innerText: item.name"></span>
                </button>
                <button
                  type="button"
                  class="btn btn__danger"
                  data-bind-event="click() { item.emit('deleteTask') }"
                >
                  Delete <span class="visually-hidden" data-bind-property="innerText: item.name"></span>
                </button>
              </div>
            </div>
          </template>
        </li>
      </template>

      ${styleTag()}
    `

    shadowRoot.querySelector('template[data-bind-scope]').scope = this.#scope
    bind(shadowRoot)
  }
})