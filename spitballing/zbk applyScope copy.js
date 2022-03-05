function getScope(el) {
  function getParentScopes(el, scopes) {
    if (!el) {
      return
    }
    
    bindRenderForScope = el[Symbol.for('template-bind-render-for-scope')]
    if (bindRenderForScope) {
      scopes.push(bindRenderForScope)
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

  let scopes = []
  getParentScopes(el, scopes)

  let scope = {};
  for (let i = scopes.length - 1; i >= 0; i -= 1) {
    let scopeDef = scopes[i]
    scope[scopeDef.key] = scopeDef.value
  }

  return scope
}

function applyScopeToEl(el) {
  let scope = getScope(el)

  function extractValues(attrName) {
    let attr = el.attributes[attrName]
    if (!attr) {
      return
    }

    try {
      with (scope) {
        return eval(`({${attr.value}})`)
      }
    }
    catch (er) {
      console.error(er)
      return
    }
  }

  // apply attributes
  let attrValues = extractValues('data-bind-attribute')
  if (attrValues) {
    for (let key of Object.keys(attrValues)) {
      let value = attrValues[key]
      el.setAttribute(key, value)
    }
  }

  // apply properties
  let propValues = extractValues('data-bind-property')
  if (propValues) {
    for (let key of Object.keys(propValues)) {
      let value = propValues[key]
      el[key] = value
    }
  }
}


function renderTemplate(template) {
  observeMutations(template.content)

  const templateIdSymbol = Symbol.for('data-bind-render-template')
  
  if (!template[templateIdSymbol]) {
    template[templateIdSymbol] = { collections: [] }
    template.parentElement.insertBefore(document.createComment("template data-bind-render"), template)
  } else {
    for (let element of template[templateIdSymbol].collections.flat()) {
      template.parentElement.removeChild(element)
    }
    template[templateIdSymbol].collections = []
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
    with (scope) {
      eval(`for (${scopeName} ${forDef}) values.push(${scopeName})`)
    }
    renderForDef = {
      scopeName,
      values
    }
  }

  let renderIfAttr = template.attributes['data-bind-render-if']
  let didRenderTemplate = false

  for (let value of renderForDef.values || [undefined]) {
    let templateFragment = template.content.cloneNode(true)
    if (renderForDef.scopeName) {
      for (let child of templateFragment.children) {
        child[Symbol.for('template-bind-render-for-scope')] = {
          key: renderForDef.scopeName,
          value: value
        }
      }
    }
    let shouldRender = true 
    if (renderIfAttr && renderIfAttr.value.trim()) {
      if (renderForDef.scopeName) {
        scope[renderForDef.scopeName] = value
      }
      with (scope) {
        shouldRender = eval(renderIfAttr.value)
      }
    }

    if (shouldRender) {
      template[templateIdSymbol].collections.push([...templateFragment.children])
      template.parentElement.insertBefore(templateFragment, template)
      didRenderTemplate = true
    }
  }

  return didRenderTemplate

  // if and for - evaluate the condition per each item
  // if not for - evaluate the condition without any items
  // not if but for - always evaluate true
  // not if and not for - do nothing
}

function applyScope(ignoredTargets = [], ignoredTemplates = []) {
  observeMutations(document.body.parentElement)

  let bindTargets = [...document.querySelectorAll('[data-bind-attribute], [data-bind-property]')]
  for (let bindTarget of bindTargets.filter(t => !ignoredTargets.includes(t))) {
    applyScopeToEl(bindTarget)
  }

  let shouldRerun = false;
  let templates = [...document.querySelectorAll('template')]
  for (let template of templates.filter(t => !ignoredTemplates.includes(t))) {
    shouldRerun ||= renderTemplate(template)
  }

  if (shouldRerun) {
    applyScope(ignoredTargets.concat(bindTargets), ignoredTemplates.concat(templates))
  }
}

function observeMutations(el) {
  if (el[Symbol.for('data-bind-observe-mutations-registered')]) {
    return
  }

  el[Symbol.for('data-bind-observe-mutations-registered')] = true

  const observer = new MutationObserver((mutationsList, observer) => {
    debugger;
    for (let mutation of mutationsList) {
      let target = mutation.target
      if (target.constructor === HTMLTemplateElement) {
        renderTemplate(target)
      } else {
        applyScopeToEl(target)
      }
    }
  });

  observer.observe(el, {
    attributes: true, 
    childList: true, 
    subtree: true,
    attributeFilter: [
      'data-bind-attribute',
      'data-bind-property',
      'data-bind-event',
      'data-bind-render-if',
      'data-bind-render-for'
    ]
  });
}