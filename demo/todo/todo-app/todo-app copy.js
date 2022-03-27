import { bind } from 'bind-aid'
import componentHtml from './index.html'

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
    shadowRoot.innerHTML = componentHtml
    bind(shadowRoot)

    this.#init()
  }

  async #init() {
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

    document.querySelector('template[data-bind-scope]').scope = scope
  }
})