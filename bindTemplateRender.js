function bindTemplateRenderFor(el) {
  if (el.constructor === HTMLTemplateElement) {
    return
  }

  let elMetadata = getElMetadata(el)
  
  resetBindTemplate(elMetadata)
  
  let scope = elMetadata.scope

  // render-for setup
  let bindExprDef = el.getAttribute('data-bind-render-for')?.trim()
  if (!bindExprDef) {  
    let splitIndex = bindExprDef.indexOf(' ')
    let forScopeName = bindExprDef.slice(0, splitIndex)
    let forDef = bindExprDef.slice(splitIndex).trim()

    elMetadata.bindRenderForEval = Function(
      `{${Object.keys(scope?._ || {}).join(', ')}}`, 
      `arguments[0] = []; for (${forScopeName} ${forDef}) arguments[0].push(${forScopeName}); return arguments[0];`
    )

    elMetadata.forScopeName = forScopeName
    
    elMetadata.bindRenderForSubId = scope?.$.subscribe(
      (s) => elMetadata.bindRenderForEval(s), 
      (values, error) => error ? null : renderTemplate(el)
    )
  }
  
  // render-if setup
  let bindRenderIfExprDef = el.getAttribute('data-bind-render-if')?.trim()
  if (!bindRenderIfExprDef) {
    let scopeNames = Object.keys(scope?._ || {})
    if (elMetadata.forScopeName) {
      scopeNames.push(elMetadata.forScopeName)
    }
    elMetadata.bindRenderIfEval = Function(`{${scopeNames.join(', ')}}`, `return (${bindRenderIfExprDef})`)
  }

  // maybe this queues the render in the next frame?
}

function renderTemplate(el) {
  let elMetadata = getElMetadata(el)

  // unrender previous elements
  elMetadata.renderForMetaCollection = elMetadata.renderForMetaCollection || []

  let items = elMetadata.bindRenderForEval(elMetadata.scope)
  for (let itemKey in items) {
    let item = items[itemKey]
    let metaItem = elMetadata.renderForMetaCollection[itemKey]
    if (!metaItem) {
      metaItem = elMetadata.renderForMetaCollection[itemKey] = {}
    }

    if (!metaItem.elements) {
      metaItem.elements = [...el.content.cloneNode(true).children]
    }

    if (elMetadata.forScopeName) {
      // unsubscribe previous scope?
      metaItem.forItemScope = new Observable({
        [newScopeName]: item
      })

      if (elMetadata.scope) {
        Object.setPrototypeOf(metaItem.forItemScope, elMetadata.scope)
      }
    }


  }

  for (let item of elMetadata.renderForMetaCollection.slice(items.length)) {
    // set false
  }

  // how to make sure mutation observer doesn't do a redundant re-bind?

  // add comments for start and end
}
// template content gets a separate mutation observer i think

// adding or changing any attribute doesn't have to be highly performant. these won't happen in a regular app.
// reacting to data changes *does* have to be highly performant


// weakmap as alternative to symbol prop?

function resetBindTemplate(elMetadata) {
  if (elMetadata.bindRenderForSubId) {
    elMetadata.scope?.$.unsubscribe(elMetadata.bindRenderForSubId)
  }

  elMetadata.forScopeName = null
  elMetadata.bindRenderForEval = null
  elMetadata.bindRenderForSubId = null
  elMetadata.bindRenderIfEval = null
}