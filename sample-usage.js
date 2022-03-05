let b = new Binder();

b.$bindInnerText("userName", "#userName");

let response = await fetch("mydata").then(r => r.json());

b.userName = response.userName;

b.$bindTemplateRepeater("toDoList", "#toDoListTemplate", {
    innerBindings(m) {
        m.$bindInnerText("")
    }
})

b.$bind("something")
    .toDisplay("span", {

    })
    .toInnerText("div")
    .toInput("#myInput")
    .toTemplateRepeater("#template", {
        innerBind(itemBinder) {
            itemBinder.$bind("$index")
                .toInnerText
        }
    })
    .toProperty("#hello", "color")

b.$bind("handleSubmit")
    .toEvent("")

b.$bindEventHandler("", "keyup", "submit.something#submit", { keys: [""] });

b.$bind((b) => b.userName + '!!!')
    .toInnerText(".something")

b.$binderInnerText((m) => m.something.inner.what)

b.$bindClass("expand", "class1 something", "#modal");

b.$bindDisplay("isActive", "span")

model.userName = 'Max';
model.birthDay = ''

syntax = `
#toDoList {
    innerText: (userName),
    style: {

    },
    class: {
        something: (userName != null)
    },

}
`