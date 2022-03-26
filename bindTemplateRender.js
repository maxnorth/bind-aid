function bindTemplateRender(el) {
  if (el.constructor !== HTMLTemplateElement) {
    return
  }

  let metaEl = getMetaElement(el)
  
  let scope = metaEl.scope
  
  resetBindTemplate(metaEl)
  
  // render-for setup
  let bindExprDef = el.getAttribute('data-bind-render-for')?.trim()
  if (bindExprDef) {  
    let splitIndex = bindExprDef.indexOf(' ')
    let forScopeName = bindExprDef.slice(0, splitIndex)
    let forDef = bindExprDef.slice(splitIndex).trim()

    metaEl.bindRenderForEval = Function(
      `{${Reflect.ownKeys(scope || {}).join(', ')}}`, 
      `arguments[0] = []; for (${forScopeName} ${forDef}) arguments[0].push(${forScopeName}); return arguments[0];`
    )

    metaEl.forScopeName = forScopeName
    
    metaEl.bindRenderForSubId = scope?.$.subscribe(
      (s) => metaEl.bindRenderForEval(s), 
      // TODO: maybe this queues the render in the next frame?
      (values, error) => error ? null : renderTemplate(el)
    )
  }
  
  // render-if setup
  let bindRenderIfExprDef = el.getAttribute('data-bind-render-if')?.trim()
  if (bindRenderIfExprDef) {
    let scopeNames = Reflect.ownKeys(scope || {})
    if (metaEl.forScopeName) {
      scopeNames.push(metaEl.forScopeName)
    }
    metaEl.bindRenderIfEval = Function(`{${scopeNames.join(', ')}}`, `return (${bindRenderIfExprDef})`)
  }

  renderTemplate(el)
}

function resetBindTemplate(metaEl) {
  if (metaEl.bindRenderForSubId) {
    metaEl.scope?.$.unsubscribe(metaEl.bindRenderForSubId)
  }

  metaEl.forScopeName = null
  metaEl.bindRenderForEval = null
  metaEl.bindRenderForSubId = null
  metaEl.bindRenderIfEval = null
}

function renderTemplate(el) {
  console.info('renderTemplate')
  let metaEl = getMetaElement(el)
  
  if (metaEl.renderForMetaItems) {
    for (let metaItem of metaEl.renderForMetaItems.values()) {
      // TODO optimization opportunity - don't remove everything every time
      for (let el of metaItem.elements) {
        el.remove()
      }
      // TODO: optimization opportunity, don't resubscribe every item each time
      metaItem.forScope.$.unsubscribe(metaItem.bindRenderIfSubId)
    }
  } else {
    metaEl.renderForMetaItems = new Map()
  }

  let renderedElementsFragment = document.createDocumentFragment()
  let items = metaEl.bindRenderForEval(metaEl.scope)
  for (let item of items) {
    let itemKey = getItemKey(item)
    let metaItem
    if (metaEl.renderForMetaItems.has(itemKey)) {
      metaItem = metaEl.renderForMetaItems.get(itemKey)
    } else {
      metaItem = {}
      metaEl.renderForMetaItems.set(itemKey, metaItem)

      // create elements
      metaItem.elements = [...el.content.cloneNode(true).children]

      // configure scope (create, inherit, assign to items)
      metaItem.forScope = new Observable({
        [metaEl.forScopeName]: item?._ || item 
      })

      if (metaEl.scope) {
        metaItem.forScope.$.inherit(metaEl.scope)
      }
      
      for (let forItemEl of metaItem.elements) {
        let forItemMetaEl = getMetaElement(forItemEl)
        forItemMetaEl.forScope = metaItem.forScope
      }
    }

    // if condition
    metaItem.renderIfResult = true
    if (metaEl.bindRenderIfEval) {        
      metaItem.renderIfResult = metaEl.bindRenderIfEval(metaItem.forScope)
      metaItem.bindRenderIfSubId = metaItem.forScope?.$.subscribe(
        (s) => metaEl.bindRenderIfEval(s), 
        // TODO: maybe this queues the render in the next frame?
        (values, error) => error ? null : renderTemplate(el)
      )
    }

    if (metaItem.renderIfResult) {
      renderedElementsFragment.append(...metaItem.elements)
    }
  }
  
  el.parentElement.insertBefore(renderedElementsFragment, el.nextSibling)
}

function getItemKey(item) {
  return item?._ || item
}

  // CORE ---------------------------------------------------------------

  // needs to render elements in collection

  // needs to not render elements that don't pass the if condition

  // needs to re-render when if condition or for expression changes

  // if without for

  // plain bind-render

  // OPTIMIZATION -------------------------------------------------------
  
  // needs to limit amount of work done on re-rendering if
  
  // needs to limit amount of work done on re-rendering for 
  
  // EDGE CASES ---------------------------------------------------------

  // Multiple matching itemKeys

  // Renaming scope

  // Mutation observer: Do not rebind when node gets removed and added back to DOM

  // Add comments for start and end

  // Detecting changes in template content