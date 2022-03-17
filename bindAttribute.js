
function bindAttribute(el) {
  // i need to evaluate the expression for the binding, while subscribing the proxy, and store the subscription id
  // when callback is invoked, use it to re-bind the attr

  let elMetadata = getElMetadata(el)
  let scope = elMetadata.scopeObservable

  let bindExprDef = el.attributes['data-bind-attribute']?.value?.trim()
  elMetadata.bindAttrEval = Function(`{${Object.keys(scope._).join(', ')}}`, `return ({${bindExprDef}})`)
  
  if (elMetadata.bindAttrSubId) {
    scope.$.unsubscribe(elMetadata.bindAttrSubId)
  }

  // subscribe to changes
  elMetadata.bindAttrSubId = scope.$.subscribe(
    (s) => elMetadata.bindAttrEval(s), 
    (values, error) => error ? null : setAttributes(el, values)
  )

  // bind current value
  let values = elMetadata.bindAttrEval(elMetadata.bindAttrScope)
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