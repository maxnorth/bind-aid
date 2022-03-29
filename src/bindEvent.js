function bindEvent(el, metaEl) {
  // i need to evaluate the expression for the binding, while subscribing the proxy, and store the subscription id
  // when callback is invoked, use it to re-bind the attr
  
  let scope = metaEl.scope
  
  if (metaEl.bindEventSubId) {
    scope.$.unsubscribe(metaEl.bindEventSubId)
  }
  
  let bindExprDef = el.attributes['data-bind-event']?.value?.trim()
  if (!bindExprDef) {
    return
  }
  
  metaEl.bindEventEval = Function(`{${Reflect.ownKeys(scope || {}).join(', ')}}`, `return ({${bindExprDef}})`)
  
  // subscribe to changes
  metaEl.bindEventSubId = scope?.$.subscribe(
    (s) => metaEl.bindEventEval(s), 
    (eventDefs, error) => error ? null : setEvents(el, eventDefs)
  )

  // bind current value
  let values = metaEl.bindEventEval(scope || {})
  setEvents(el, values)
}

function setEvents(el, eventDefs) {
  // console.info('setEvents')
  let metaEl = getMetaElement(el)
  metaEl.bindEventDefs = metaEl.bindEventDefs || {}

  for (let eventName of Reflect.ownKeys(eventDefs || {})) {
    let newEventDef = eventDefs[eventName]
    let existingEventDef = metaEl.bindEventDefs[eventName]
    if (existingEventDef && existingEventDef !== newEventDef) {
      el.removeEventListener(eventName, existingEventDef, false)
    }
    if (newEventDef) {
      el.addEventListener(eventName, newEventDef, false)
    }
  }

  for (let eventName in metaEl.bindEventDefs) {
    if (!eventName in eventDefs) {
      el.removeEventListener(eventName, metaEl.bindEventDefs[eventName], false)
    }
  }

  metaEl.bindEventDefs = eventDefs
}

window.bindEvent = bindEvent