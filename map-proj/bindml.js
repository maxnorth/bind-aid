function getScope(el) {
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

  let scopes = []
  getParentScopes(el, scopes)

  let scope = {};
  for (let i = scopes.length - 1; i >= 0; i -= 1) {
    let scopeDef = scopes[i]
    scope[scopeDef.key] = scopeDef.value
  }

  return scope
}

function bindElement(el) {
  let scope = getScope(el)

  function extractValues(attrName) {
    let attr = el.attributes[attrName]
    if (!attr) {
      return
    }

    try {
      let evaluateValues = Function(`with (arguments[0]) return ({${attr.value}})`)
      return evaluateValues(scope)
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
      el[key] = value
    }
  }

  // apply events
  let eventValues = extractValues('data-bind-event')
  if (eventValues) {
    for (let eventName of Object.keys(eventValues)) {
      let eventHandler = eventValues[eventName]
      let priorHandlers = el[Symbol.for('data-bind-event-handlers')] || []
      for (let priorHandler of priorHandlers) {
        el.removeEventListener(eventName, priorHandler, false)
      }
      el.addEventListener(eventName, eventHandler, false)
      el[Symbol.for('data-bind-event-handlers')] = [eventHandler]
    }
  }
}

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

async function applyScopeAsync(root = document.body.parentNode, ignoredTargets = []) {
  let queuedCalls = window[Symbol.for('data-bind-apply-scope-queue')] || []
  queuedCalls.push([root, ignoredTargets])
  if (window[Symbol.for('data-bind-apply-scope-queue')]) {
    return
  }
  window[Symbol.for('data-bind-apply-scope-queue')] = queuedCalls
  
  await asyncTimeout(0)
  
  let queuedCalls2 = window[Symbol.for('data-bind-apply-scope-queue')]
  delete window[Symbol.for('data-bind-apply-scope-queue')]

  let targetSelectors = [
    '[data-bind-attribute]',
    '[data-bind-property]',
    '[data-bind-event]',
    'template[data-bind-render-if]',
    'template[data-bind-render-for]',
    'template[data-bind-render]'
    // [data-bind-extension]
  ]

  let allTargets = []
  let allIgnoredTargets = []
  for (let [root, ignoredTargets] of queuedCalls2) {
    allTargets = allTargets.concat([...root.querySelectorAll(targetSelectors.join(', '))])
    allIgnoredTargets = allIgnoredTargets.concat(ignoredTargets)
  }
  let filteredTargets = allTargets.filter(t => !allIgnoredTargets.includes(t))
  for (let target of filteredTargets) {
    if (!target.isConnected) {
      continue
    }
    if (target.constructor === HTMLTemplateElement) {    
      renderTemplate(target)
    } else {
      bindElement(target)
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
        continue
      }
      if (target.matches('template[data-bind-render-if], template[data-bind-render-for]')) {
        renderTemplate(target)
      } 
      if (target.matches('[data-bind-attribute], [data-bind-property], [data-bind-event]')) {
        bindElement(target)
      }
      // known issues here, could be other changes involved. should check att changed
      if (target.matches(['[data-bind-scope]'])) {
        applyScopeAsync(target)
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
      'data-bind-scope',
      'data-bind-attribute',
      'data-bind-property',
      'data-bind-event',
      'data-bind-render-if',
      'data-bind-render-for'
    ]
  });

  el.observer = observer
}

function createProxy(target, updateCallback) {
  return new Proxy(target, {
    get(target, prop) {
      if (prop === '_') {
        return target
      }
      let value = target[prop]
      if (typeof value === 'object') {
        return createProxy(value, updateCallback)
      }
      return value
    },
    set(target, prop, value) {
      target[prop] = value
      updateCallback()
      return true
    }
  })
}

function ReactiveProxy(root, value) {
  return createProxy(value, () => applyScopeAsync(root))
}

function asyncTimeout(delay) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      resolve(timeoutId);
    }, delay);
  });
}

window.addEventListener('load', async () => {
  observeMutations(document.body.parentNode)
  await applyScopeAsync()
})