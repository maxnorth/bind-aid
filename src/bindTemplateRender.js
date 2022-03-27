function bindTemplateRender(el, metaEl) {
  if (el.constructor !== HTMLTemplateElement) {
    return
  }
  
  let scope = metaEl.scope
  
  resetBindTemplate(metaEl)
  
  // render-for setup
  let bindExprDef = el.getAttribute('data-bind-render-for')?.trim()
  if (bindExprDef) {  
    let splitIndex = bindExprDef.indexOf(' ')
    let renderItemScopeName = bindExprDef.slice(0, splitIndex)
    let forDef = bindExprDef.slice(splitIndex).trim()

    metaEl.bindRenderForEval = Function(
      `{${Reflect.ownKeys(scope || {}).join(', ')}}`, 
      `arguments[0] = []; for (${renderItemScopeName} ${forDef}) arguments[0].push(${renderItemScopeName}); return arguments[0];`
    )

    metaEl.renderItemScopeName = renderItemScopeName
    
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
    if (metaEl.renderItemScopeName) {
      scopeNames.push(metaEl.renderItemScopeName)
    }
    metaEl.bindRenderIfEval = Function(`{${scopeNames.join(', ')}}`, `return (${bindRenderIfExprDef})`)
  } else if (el.attributes['data-bind-render']) {
    metaEl.bindRenderIfEval = () => true
  }

  renderTemplate(el)
}

function resetBindTemplate(metaEl) {
  if (metaEl.bindRenderForSubId) {
    metaEl.scope?.$.unsubscribe(metaEl.bindRenderForSubId)
  }

  metaEl.renderItemScopeName = null
  metaEl.bindRenderForEval = null
  metaEl.bindRenderForSubId = null
  metaEl.bindRenderIfEval = null
}

function renderTemplate(el) {
  console.info('renderTemplate')
  let metaEl = getMetaElement(el)
  
  if (metaEl.renderMetaItems) {
    for (let metaItem of metaEl.renderMetaItems.values()) {
      // TODO optimization opportunity - don't remove everything every time
      for (let el of metaItem.elements) {
        el.remove()
      }
      // TODO: optimization opportunity, don't resubscribe every item each time
      metaItem.renderItemScope.$.unsubscribe(metaItem.bindRenderIfSubId)
    }
  } else {
    metaEl.renderMetaItems = new Map()
  }

  let renderedElementsFragment = document.createDocumentFragment()
  let items = []
  if (metaEl.bindRenderForEval) {
    items = metaEl.bindRenderForEval(metaEl.scope)
  } else if (metaEl.bindRenderIfEval) {
    items = [renderSingleton]
  }
  for (let item of items) {
    let itemKey = getItemKey(item)
    let metaItem
    if (metaEl.renderMetaItems.has(itemKey)) {
      metaItem = metaEl.renderMetaItems.get(itemKey)
    } else {
      metaItem = {}
      metaEl.renderMetaItems.set(itemKey, metaItem)

      // create elements
      metaItem.elements = [...el.content.cloneNode(true).children]

      // configure scope (create, inherit, assign to items)
      if (metaEl.renderItemScopeName) {
        metaItem.renderItemScope = new Observable({
          [metaEl.renderItemScopeName]: item?._ || item 
        })
  
        if (metaEl.scope) {
          metaItem.renderItemScope.$.inherit(metaEl.scope)
        }
      } else {
        metaItem.renderItemScope = metaEl.scope
      }
            
      for (let itemEl of metaItem.elements) {
        let itemMetaEl = getMetaElement(itemEl)
        itemMetaEl.renderItemScope = metaItem.renderItemScope
      }
    }

    // if condition
    metaItem.renderIfResult = true
    if (metaEl.bindRenderIfEval) {        
      metaItem.renderIfResult = metaEl.bindRenderIfEval(metaItem.renderItemScope)
      metaItem.bindRenderIfSubId = metaItem.renderItemScope?.$.subscribe(
        (s) => metaEl.bindRenderIfEval(s), 
        // TODO: maybe this queues the render in the next frame?
        (values, error) => error ? null : renderTemplate(el)
      )
    }

    if (metaItem.renderIfResult) {
      renderedElementsFragment.append(...metaItem.elements)
    }
  }
  
  el.parentNode.insertBefore(renderedElementsFragment, el.nextSibling)
}

function getItemKey(item) {
  return item?._ || item
}

let renderSingleton = {}

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

window.bindTemplateRender = bindTemplateRender