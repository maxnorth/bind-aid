// define a data model
// describe how it reacts to changes in the data model

class Test extends HTMLElement {
    constructor() {
        this.configureRenderer();
        this.configureObserver();
        this.initializeData();
    }

    async initializeData() {
        let result = await fetch().then(r => r.json());
        this.$d.userName = result.userName;
        this.$d.emailAddress = result.emailAddress;
    }

    configureObserver() {
        this.$d.bind("userName", "#userNameInput,#");
        this.$d.map("toDoItems", "#something").bindItem()

        observer.observe(this, {

        })
    }
}


// scenario
// one field upates and renders
// another field updates and renders an area that needs updating by another field