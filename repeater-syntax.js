var obj = {};

obj.name => elementInnerText

obj.addresses => template
    address.firstLine => elementInnerText




obj.name.bindInnerText("selector")

binder.$bindTemplateRepeater("addresses", "#template", itemBinder => {
    itemBinder.bind("firstLine").toAttribute("span", "firstLine")
})