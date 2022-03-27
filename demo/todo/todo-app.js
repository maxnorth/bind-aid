const FILTER_MAP = {
  All: () => true,
  Active: task => !task.completed,
  Completed: task => task.completed
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

let id_counter = 3

customElements.define('todo-app', class extends HTMLElement {
  #scope;

  constructor() {
    super()

    let shadowRoot = this.attachShadow({ mode: 'closed' })

    let scope = this.#scope = Observable({
      tasks: [
        { id: "todo-0", name: "Eat", completed: false },
        { id: "todo-1", name: "Sleep", completed: false },
        { id: "todo-2", name: "Repeat", completed: false }
      ],
      addTask(taskName) {
        scope.tasks.push({ 
          id: "todo-" + id_counter++, 
          name: taskName, 
          completed: false 
        })
      },
      filter: 'All',
      get filteredTasks() {
        return scope.tasks.filter(FILTER_MAP[scope.filter])
      },
      filterNames: FILTER_NAMES
    })

    shadowRoot.innerHTML = /*html*/`
      <template data-bind-scope="app" data-bind-render>
        <div class="todoapp stack-large">
          <todo-form data-bind-property="addTask: app.addTask"></todo-form>
          <div class="filters btn-group stack-exception">
            <template 
              data-bind-render-for="filterName of app.filterNames"
              data-bind-render-key="filterName"
            >
              <todo-filter-button 
                data-bind-event="click() { app.filter = filterName }"
                data-bind-property="
                  filterName: filterName,
                  isPressed: filterName === app.filter
                ">
              </todo-filter-button>
            </template>
          </div>
          <h2 
            id="list-heading" 
            tabIndex="-1" 
            data-bind-property="
              innerText: \`\${app.tasks.length} task\${app.tasks.length === 1 ? '' : 's'} remaining\`
            "
          ></h2>
          <ul
            role="list"
            class="todo-list stack-large stack-exception"
            aria-labelledby="list-heading"
          >
            <template data-bind-render-for="task of app.filteredTasks" data-bind-render-key="task.id">
              <todo-item data-bind-property="
                id: task.id,
                name: task.name,
                completed: task.completed
              "
              data-bind-event="
                toggleTaskCompleted() { task.completed = !task.completed },
                deleteTask() { app.tasks = app.tasks.filter(t => t.id !== task.id) },
                editTask(e) { app.tasks.find(t => t.id === task.id).name = e.detail.name }
              "></todo-item>
            </template>
          </ul>
        </div>
      </template>

      ${styleTag()}
    `

    shadowRoot.querySelector('template[data-bind-scope]').scope = this.#scope
    bind(shadowRoot)
  }
})