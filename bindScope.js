
function bindScope(el) {
  // necessary? should a scope attr change proactively find subscribers? any harm in this?
  // i think this is needed. something needs to handl the 'scope' property assignment/broadcasting
  // broadcast scope when it changes. elements only re-bind using locally defined scope? scope assignment/management is externalized?
  // maybe each element fetches it's own scope using a shared method, but bind scope notifies them to do it again
  let elMetadata = getElMetadata(el)
  
  elMetadata.scopeObservable = new Observable(getScope(el))

  if (el.getAttribute('data-bind-scope')) {
    Object.defineProperty(el, 'scope', {
      set(value) {
        elMetadata.bindScope = value
        broadcastScopeValueChange(el)
      },
      get() {
        return elMetadata.bindScope
      }
    })
  }
}

function getScope(el) {
  let scopes = []
  getParentScopes(el, scopes)

  let scope = {}
  // iterate in reverse
  for (let i = scopes.length - 1; i >= 0; i -= 1) {
    let scopeDef = scopes[i]
    scope[scopeDef.key] = scopeDef.value
  }

  return scope
}

function getParentScopes(el, scopes) {
  if (!el) {
    return
  }
  
  bindRenderScopes = el[Symbol.for('template-bind-render-scopes')]
  for (let bindRenderScope of bindRenderScopes || []) {
    scopes.push(bindRenderScope)
  }

  let scopeAttr = el.attributes['data-bind-scope']
  if (scopeAttr) {
    scopes.push({ 
      key: scopeAttr.value, 
      value: el.scope 
    })
  }
  
  getParentScopes(el.parentElement, scopes)
}

function broadcastScopeValueChange(el) {
  // this reassigns fields in existing scope objects only
  // get key and value
  // apply to this element
  // assign to observable scope in all child elements
  // this will re-evaluate *everything*, won't it?
}

function broadcastScopeSetChange() {
  // use bindElement(el)
}

// handle assignment and passing on to children
// handle creating/removing