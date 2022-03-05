function getScope(el) {
  function getParentScopes(el, scopes) {
    if (!el) {
      return
    }

    let scopeAttr = el.attributes['data-bind-scope']
    if (scopeAttr) {
      scopes.push({ key: scopeAttr.value, value: el.scope })
    }
    
    getParentScopes(el.parentElement, scopes)
  }

  let scopes = []
  getParentScopes(el, scopes)

  let scope = {};
  for (let i = scopes.length - 1; i >= 0; i -= 1) {
    let scopeDef = scopes[i]
    scope[scopeDef.key] = scopeDef.value
  }

  return scope
}


