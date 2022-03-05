// customElements.define("test", class extends HTMLElement {
//     constructor() {
//         this.something = 8;

//         this.setAttribute("data-publish-property", "something");
//         this.setAttribute("data-publish-attribute", "name");
//         this.setAttribute("data-scope-something", "span.cool");
//         this.setAttribute("data-property-hello", "something");
//     }
// });

// customElements.define("test2", class extends HTMLElement {
//     constructor() {
//         this.something = 8;

//         this.publishProperty("something");
//         this.publishAttribute("name");
//     }
// });

customElements.define("test2", class extends HTMLElement {
    constructor() {
        this.model = Binder();
        this.configureBindings();
        this.initData();
        this.show();
    }

    configureBindings() {
        this.model.userName = "joe";
        this.recoveryJobs = 
    }

    initData() {
        this.model.userName = "joe";
        this.recoveryJobs = [
            {
                id: 1,
                name: "something",
                status: "completed"
            }
        ]
    }

    show() {
        for (let el of document.querySelectorAll(".hide")) {
            el.classList.remove("hide");
        }
    }
});
