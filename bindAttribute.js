
function bindAttribute(el) {
  // i need to evaluate the expression for the binding, while subscribing the proxy, and store the subscription id
  // when callback is invoked, use it to re-bind the attr

  let elMetadata = getElMetadata(el)
  
  if (elMetadata.bindAttrSubId) {
    scope.$.unsubscribe(elMetadata.bindAttrSubId)
  }
  
  let bindExprDef = el.attributes['data-bind-attribute']?.value?.trim()
  if (!bindExprDef) {
    return
  }
  
  let scope = elMetadata.scope

  elMetadata.bindAttrEval = Function(`{${Object.keys(scope?._ || {}).join(', ')}}`, `return ({${bindExprDef}})`)
  
  // subscribe to changes
  elMetadata.bindAttrSubId = scope?.$.subscribe(
    (s) => elMetadata.bindAttrEval(s), 
    (values, error) => error ? null : setAttributes(el, values)
  )

  // bind current value
  let values = elMetadata.bindAttrEval(scope || {})
  setAttributes(el, values)
}

function setAttributes(el, values) {
  if (values) {
    for (let key of Object.keys(values)) {
      let value = String(values[key])
      if (value !== el.getAttribute(key)) {
        el.setAttribute(key, value)
      }
    }
  }
}