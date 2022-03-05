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
      let value = String(attrValues[key])
      if (value !== el.getAttribute(key)) {
        el.setAttribute(key, value)
      }
    }
  }

  // apply properties
  let propValues = extractValues('data-bind-property')
  if (propValues) {
    for (let key of Object.keys(propValues)) {
      let value = propValues[key]
      if (value !== el[key]) {
        el[key] = value
      }
    }
  }
}


function renderTemplate(template) {
  observeMutations(template)

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
  let templateCurrentSiblings = [...template.parent.children]

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
    }
  }

  applyScope(template.parentElement, templateCurrentSiblings)
}

function applyScope(root = document.body.parentElement, ignoredTargets = []) {
  // this should not target root, it should always target document.body.parentElement
  observeMutations(document.body.parentElement)

  let targetSelectors = [
    '[data-bind-attribute]',
    '[data-bind-property]',
    'template[data-bind-render-if]',
    'template[data-bind-render-for]'
  ]

  let targets = [...document.querySelectorAll(targetSelectors.join(', '))]
  targets = targets.filter(t => !targets.includes(t))
  for (let target of targets) {
    if (target.constructor === HTMLTemplateElement) {    
      renderTemplate(target)
    } else {
      applyScopeToEl(target)
    }
  }
}

function observeMutations(el) {
  if (el[Symbol.for('data-bind-observe-mutations-registered')]) {
    return
  }

  el[Symbol.for('data-bind-observe-mutations-registered')] = true

  const isTemplate = el.constructor === HTMLTemplateElement

  const observer = new MutationObserver((mutationsList, observer) => {
    if (isTemplate) {
      renderTemplate(el)
      return
    }

    let targets = []
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        targets.push(...mutation.addedNodes)
      } else {
        targets.push(mutation.target)
      }
    }

    for (let target of targets) {
      if (!target.matches) {
        return
      }
      if (target.matches('template[data-bind-render-if], template[data-bind-render-for]')) {
        renderTemplate(target)
      } 
      if (target.matches('[data-bind-attribute], [data-bind-property], [data-bind-event]')) {
        applyScopeToEl(target)
      }
    }
  });

  observer.observe(isTemplate ? el.content : el, {
    attributes: true, 
    childList: true, 
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true,
    attributeFilter: [
      'data-bind-attribute',
      'data-bind-property',
      'data-bind-event',
      'data-bind-render-if',
      'data-bind-render-for'
    ]
  });

  el.observer = observer
}