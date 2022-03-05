import toDoAppTemplate from "./toDoAppTemplate.html";
import Binder from "../binder-prototype";

customElements.define("to-do-app", class ToDoApp extends HTMLElement {
    constructor() {
        this.innerHTML = toDoAppTemplate
        this.model = new Binder(this)
        this.configureBindings()
    }

    configureBindings() {
        this.model.$bindInputValue("newTodo", "#newTodoInput")
        this.model.$bindInputValue("allDone", "#toggle-all")
        this.model.$bindDisplay("todos.length", ".content") //TODO

        this.model.$bindTemplateRepeater("filteredTodos", "#to-do-list-template")

        this.model.$bindInnerText("remaining", "#remaining-count")
    }
});