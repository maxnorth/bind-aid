function Binder(rootEl = document, target) {
    let bindings = {
        innerText: {},
        attribute: {},
        inputValue: {},
        property: {},
        templateRepeater: {}
    }

    function executeBinding(binding, prop) {
        if (binding[prop]) {
            binding[prop]();
        }
    };

    let binder = new Proxy(target || {}, { 
        get(target, prop, receiver) {
            console.log("hey")
            return target[prop];
        }, 
        set(target, prop, value) {
            target[prop] = value;
            if (prop.startsWith("$")) {
                return;  
            }
            executeBinding(bindings.innerText, prop);
            executeBinding(bindings.attribute, prop);
            executeBinding(bindings.inputValue, prop);
            executeBinding(bindings.property, prop);
            executeBinding(bindings.templateRepeater, prop);
        }
    });

    binder.$bindInnerText = function (key, selector) {
        bindings.innerText[key] = bindInnerText.bind(binder, key, selector);
    }

    binder.$bindAttribute = function (key, attribute, selector) {
        bindings.attribute[key] = bindAttribute.bind(binder, key, attribute, selector);
    }

    binder.$bindInputValue = function (key, selector) {
        bindings.inputValue[key] = bindInputValue.bind(binder, key, selector);
        
        for (var el of rootEl.querySelectorAll(selector)) {
            el.oninput = (function(target) {
                binder[key] = target.value;
            }).bind(binder, el);
        }
    }
    
    binder.$bindProperty = function (key, propName, selector) {
        bindings.property[key] = bindProperty.bind(binder, key, propName, selector);
    }

    binder.$bindTemplateRepeater = function(key, selector) {
        let templateEl = rootEl.querySelector(selector);
        if (!templateEl || templateEl.nodeName != "TEMPLATE") {
            debugger;
            return;
        }

        let root = templateEl;

        let startMarker = document.createElement("meta");
        startMarker.setAttribute("data-delimiter", "start");
        let endMarker = document.createElement("meta");
        endMarker.setAttribute("data-delimiter", "end");

        root.parentNode.insertBefore(startMarker, root.nextSibling);
        root.parentNode.insertBefore(endMarker, startMarker.nextSibling);

        bindings.templateRepeater[key] = bindTemplateRepeater.bind(binder, key, templateEl, startMarker, endMarker);
    }

    
    return binder;

    // functions --------------------------------------------------------------

    function bindInnerText(key, selector) {
        for (var el of rootEl.querySelectorAll(selector)) {
            if (!el.childElementCount) el.innerText = this[key];
        }
    }

    function bindAttribute(key, attribute, selector) {
        for (var el of rootEl.querySelectorAll(selector)) {
            el.setAttribute(attribute, this[key]);
        }
    }

    function bindInputValue(key, selector) {
        for (var el of rootEl.querySelectorAll(selector)) {
            if (["INPUT", "SELECT", "TEXTAREA"].includes(el.nodeName)) {
                el.setAttribute("value", this[key]);
            }
        }
    }
    
    function bindProperty(key, propName, selector) {
        for (var el of rootEl.querySelectorAll(selector)) {
            el[propName] = this[key];
        }
    }
    
    function bindTemplateRepeater(key, templateEl, startMarker, endMarker) {
        while (startMarker.nextSibling != endMarker) {
            startMarker.nextSibling.remove();
        }
        
        let data = this[key];        
        let i = 0;
        for (let item of data || []) {
            i += 1;
            let itemMarkerTemplate = document.createElement("meta");
            itemMarkerTemplate.setAttribute("data-owner", "");
            itemMarkerTemplate.setAttribute("data-section", i);
            root.parentNode.insertBefore(itemMarkerTemplate, endMarker);

            let templateContent = templateEl.content.cloneNode(true).childNodes;
            for (let node of [...templateContent]) {
                console.log(node);
                root.parentNode.insertBefore(node, endMarker);
            }
        }
    }
}