
function bindProperty(el) {
  // bind properties and subscribe to changes

  // i need to evaluate the expression for the binding, while subscribing the proxy, and store the subscription id
  // when callback is invoked, use it to re-bind the attr

  let elMetadata = getElMetadata(el)
  
  if (elMetadata.bindPropSubId) {
    scope.$.unsubscribe(elMetadata.bindPropSubId)
  }
  
  let bindExprDef = el.attributes['data-bind-property']?.value?.trim()
  if (!bindExprDef) {
    return
  }
  
  let scope = elMetadata.scope

  elMetadata.bindPropEval = Function(`{${Object.keys(scope?._ || {}).join(', ')}}`, `return ({${bindExprDef}})`)
  
  // subscribe to changes
  elMetadata.bindPropSubId = scope?.$.subscribe(
    (s) => elMetadata.bindPropEval(s), 
    (values, error) => error ? null : setProperties(el, values)
  )

  // bind current value
  let values = elMetadata.bindPropEval(scope || {})
  setProperties(el, values)
}

function setProperties(el, values) {
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