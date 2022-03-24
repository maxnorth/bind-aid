
function bindScope(el) {
  let elMeta = getMetaElement(el)

  elMeta.scopeName = el.getAttribute('data-bind-scope')
  elMeta.scope = getScope(el, elMeta.scopeName)
  elMeta.scopeValue = el.scope

  if (!elMeta.scopePropertyDefined) {
    Object.defineProperty(el, 'scope', {
      set(value) {
        elMeta.scopeValue = value
        if (elMeta.scopeName) {
          elMeta.scope[elMeta.scopeName] = value
        }
      },
      get() {
        return elMeta.scopeName ? elMeta.scope[elMeta.scopeName] : elMeta.scopeValue
      }
    })

    elMeta.scopePropertyDefined = true
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
