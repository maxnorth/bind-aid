
function bindProperty(el) {
  // bind properties and subscribe to changes

  // i need to evaluate the expression for the binding, while subscribing the proxy, and store the subscription id
  // when callback is invoked, use it to re-bind the attr

  let metaEl = getMetaElement(el)
  
  if (metaEl.bindPropSubId) {
    scope.$.unsubscribe(metaEl.bindPropSubId)
  }
  
  let bindExprDef = el.attributes['data-bind-property']?.value?.trim()
  if (!bindExprDef) {
    return
  }
  
  let scope = metaEl.scope

  metaEl.bindPropEval = Function(`{${Reflect.ownKeys(scope || {}).join(', ')}}`, `return ({${bindExprDef}})`)
  
  // subscribe to changes
  metaEl.bindPropSubId = scope?.$.subscribe(
    (s) => metaEl.bindPropEval(s), 
    (values, error) => error ? null : setProperties(el, values)
  )

  // bind current value
  let values = metaEl.bindPropEval(scope || {})
  setProperties(el, values)
}

function setProperties(el, values) {
  if (values) {
    for (let key of Reflect.ownKeys(values)) {
      let value = String(values[key])
      // TODO should i keep this 'if' check? should i assume get/set work the same and are defined?
      if (value !== el[key]) {
        el[key] = value
      }
    }
  }
}