customElements.define('todo-list', class extends HTMLElement {
  #scope
  
  constructor() {
    super()
    this.#scope = Observable(new ToDoListViewModel())
    let shadowRoot = this.attachShadow({ mode: 'closed' })
    shadowRoot.innerHTML = componentHtml
    shadowRoot.querySelector('template[data-bind-scope]').scope = this.#scope
    bind(shadowRoot)
  }
})

const FILTER_MAP = {
  All: () => true,
  Active: task => !task.completed,
  Completed: task => task.completed
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

class ToDoListViewModel {    
  tasks = [
    { id: "todo-0", name: "Eat", completed: true },
    { id: "todo-1", name: "Sleep", completed: false },
    { id: "todo-2", name: "Repeat", completed: false }
  ]

  addTask() {
    // TODO
  }

  filter = 'TODO'

  get filteredTasks() {
    return scope.tasks.filter(FILTER_MAP[scope.filter])
  }

  filterNames = FILTER_NAMES
}

const componentHtml = /*html*/`
  <template data-bind-scope="root" data-bind-render>
    <div class="todoapp stack-large">
      <todo-form data-bind-property="addTask: root.addTask"></todo-form>
      <div class="filters btn-group stack-exception">
        <template
          data-bind-render-for="filterName of root.filterNames"
          data-bind-render-key="filterName"
        >
          <todo-filter-button data-bind-property="
            name: filterName,
            isPressed: filterName === root.filter,
            setFilter: root.setFilter
          "></todo-filter-button>
        </template>
      </div>
      <h2 
        id="list-heading" 
        tabIndex="-1" 
        data-bind-property="innerText: \`${root.taskList.length} task${root.taskList.length === 1 ? '' : 's'} remaining\`"
      ></h2>
      <ul
        role="list"
        class="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        <template data-bind-render-for="task of root.filteredTasks" data-bind-render-key="task.id">
          <todo-item
            data-bind-property="
              name: task.name,
              completed: task.completed,
              toggleTaskCompleted: toggleTaskCompleted,
              deleteTask: deleteTask,
              editTask: editTask
            "
            data-bind-event="
              toggleTaskCompleted: toggleTaskCompleted,
              deleteTask: deleteTask,
              editTask: editTask
            "
          ></todo-item>
        </template>
      </ul>
    </div>
  </template>
`