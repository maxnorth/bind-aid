
function bindTemplateRenderFor(el) {
  if (el.constructor === HTMLTemplateElement) {
    return
  }
  // i need to evaluate the expression for the binding, while subscribing the proxy, and store the subscription id
  // when callback is invoked, use it to re-bind the attr

  let elMetadata = getElMetadata(el)
  
  if (elMetadata.bindRenderForSubId) {
    scope.$.unsubscribe(elMetadata.bindRenderForSubId)
  }
  
  let bindExprDef = el.attributes['data-bind-property']?.value?.trim()
  if (!bindExprDef) {
    return
  }
  
  let scope = elMetadata.scope

  elMetadata.bindPropEval = Function(`{${Object.keys(scope?._ || {}).join(', ')}}`, `return ({${bindExprDef}})`)
  
  // subscribe to changes
  elMetadata.bindRenderForSubId = scope?.$.subscribe(
    (s) => elMetadata.bindPropEval(s), 
    (values, error) => error ? null : setProperties(el, values)
  )
}


function bindTemplateRenderFor() {
  // bind template children and subscribe to changes

  // weakmap!!! use this for element references

  // how to limit amount of rebinding needed when element gets attached back to the DOM (it may be out of date)
}

function renderTemplate(el, values) {
  if (values) {
    for (let key of Object.keys(values)) {
      let value = String(values[key])
      // TODO should i keep this 'if' check? should i assume get/set work the same and are defined?
      if (value !== el[key]) {
        el[key] = value
      }
    }
  }
}
// templates get a separate mutation observer i think

// adding or changing any attribute doesn't have to be highly performant. these won't happen in a regular app.
// reacting to data changes *does* have to be highly performant


// weakmap as alternative to symbol prop?
