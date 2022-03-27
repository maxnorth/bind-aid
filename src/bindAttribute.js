
function bindAttribute(el, metaEl) {
  // i need to evaluate the expression for the binding, while subscribing the proxy, and store the subscription id
  // when callback is invoked, use it to re-bind the attr
  
  let scope = metaEl.scope
  
  if (metaEl.bindAttrSubId) {
    scope.$.unsubscribe(metaEl.bindAttrSubId)
  }
  
  let bindExprDef = el.attributes['data-bind-attribute']?.value?.trim()
  if (!bindExprDef) {
    return
  }

  metaEl.bindAttrEval = Function(`{${Reflect.ownKeys(scope || {}).join(', ')}}`, `return ({${bindExprDef}})`)
  
  // subscribe to changes
  metaEl.bindAttrSubId = scope?.$.subscribe(
    (s) => metaEl.bindAttrEval(s), 
    (values, error) => error ? null : setAttributes(el, values)
  )

  // bind current value
  let values = metaEl.bindAttrEval(scope || {})
  setAttributes(el, values)
}

function setAttributes(el, values) {
  console.info('setAttributes')
  if (values) {
    for (let key of Reflect.ownKeys(values)) {
      let value = values[key]
      if (value === undefined) {
        el.removeAttribute(key)
        continue
      }
      let strValue = value === null ? "" : String(value)
      if (strValue !== el.getAttribute(key)) {
        el.setAttribute(key, strValue)
      }
    }
  }
}

window.bindAttribute = bindAttribute