
function bindScope(el, metaEl) {
  console.info('bindScope')

  metaEl.scopeName = el.getAttribute('data-bind-scope')
  metaEl.scope = getScope(el, metaEl.scopeName)
  metaEl.scopeValue = el.scope

  if (!metaEl.scopePropertyDefined) {
    Object.defineProperty(el, 'scope', {
      set(value) {
        metaEl.scopeValue = value
        if (metaEl.scopeName) {
          metaEl.scope[metaEl.scopeName] = value
        }
      },
      get() {
        return metaEl.scopeName ? metaEl.scope[metaEl.scopeName] : metaEl.scopeValue
      }
    })

    metaEl.scopePropertyDefined = true
  }
}

function getScope(el, newScopeName) {
  let metaEl = getMetaElement(el)
  let inheritedScope = metaEl.forScope
  let parentEl = el.parentElement

  while (parentEl && !inheritedScope) {
    let parentmetaEl = getMetaElement(parentEl)
    inheritedScope = parentmetaEl.scope || parentmetaEl.forScope
    parentEl = parentEl.parentElement
  }

  if (!newScopeName) {
    return inheritedScope
  }

  let newScope = new Observable({
    [newScopeName]: el.scope
  })

  if (inheritedScope) {
    newScope.$.inherit(inheritedScope)
  }

  return newScope
}
