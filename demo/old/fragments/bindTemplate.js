
function renderTemplate(template) {
  observeMutations(template)
    
  if (!template[Symbol.for('data-bind-render-template-end-ref')]) {
    let templateEndRef = document.createComment("template data-bind-render end")
    template[Symbol.for('data-bind-render-template-end-ref')] = templateEndRef
    // TODO: make this a non-essential reference (i.e. i can remove from DOM without breaking things)
    template.parentNode.insertBefore(templateEndRef, template.nextSibling)
    template.parentNode.insertBefore(document.createComment("template data-bind-render start"), template.nextSibling)
  }

  let scope = getScope(template)
  
  let renderForDef = {}
  let renderForAttr = template.attributes['data-bind-render-for']
  if (renderForAttr) {
    let renderForValue = renderForAttr.value.trim()
    let splitIndex = renderForValue.indexOf(' ')
    let scopeName = renderForValue.slice(0, splitIndex)
    let forDef = renderForValue.slice(splitIndex).trim()
    let values = []
    evaluateForDef = Function(`with (arguments[0]) for (${scopeName} ${forDef}) arguments[1].push(${scopeName})`)
    evaluateForDef(scope, values)
    renderForDef = {
      scopeName,
      values
    }
  }

  let renderIfAttr = template.attributes['data-bind-render-if']
  let templateCurrentSiblings = [...template.parentNode.children]

  let bindTemplateScopeAttr = template.attributes['data-bind-scope']
  let bindTemplateScopeName = bindTemplateScopeAttr?.value?.trim()

  let prevElementMap = template[Symbol.for('data-bind-render-template-map')] || new Map()
  let newElementMap = template[Symbol.for('data-bind-render-template-map')] = new Map()

  let templateEndRef = template[Symbol.for('data-bind-render-template-end-ref')]
  const activeElement = document.activeElement
  
  for (let element of [...prevElementMap.values()].flat()) {
    element.remove()
  }

  for (let value of renderForDef.values || [Symbol.for('data-bind-render-template-non-for-item')]) {
    if (value._) {
      value = value._
    }
    // content mapping
    let templateFragment
    if (prevElementMap.has(value)) {
      templateFragment = document.createDocumentFragment()
      let itemElements = prevElementMap.get(value)
      newElementMap.set(value, itemElements)
      for (let element of itemElements) {
        templateFragment.append(element)
      }
    } else {
      templateFragment = template.content.cloneNode(true)
      newElementMap.set(value, [...templateFragment.children])
    }
    
    // set element scopes
    let bindRenderScopes = []
    if (renderForDef.scopeName) {
      bindRenderScopes.push({
        key: renderForDef.scopeName,
        value: value
      })
    }

    if (bindTemplateScopeName) {
      bindRenderScopes.push({
        key: bindTemplateScopeName,
        value: template.scope
      })
    }
    
    for (let child of templateFragment.children) {
      child[Symbol.for('template-bind-render-scopes')] = bindRenderScopes
    }

    // if logic
    let shouldRender = true 
    if (renderIfAttr && renderIfAttr.value.trim()) {
      if (renderForDef.scopeName) {
        scope[renderForDef.scopeName] = value
      }
      evalIfDef = Function(`with (arguments[0]) return ${renderIfAttr.value}`)
      shouldRender = evalIfDef(scope)
    }

    if (shouldRender) {
      template.parentNode.insertBefore(templateFragment, templateEndRef)
    }
  }

  activeElement.focus()
  applyScopeAsync(template.parentNode, templateCurrentSiblings)
}