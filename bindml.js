// ----------------------------------------------------------------------------------

// target all inner elements
// bind to a root node, find all relevant child nodes, bind them, 
// each element: bind once, let mutation observer and object observer subscription handle it from there

// subcription handles rebinding/re-rendering
// attribute observer handles rebinding when attributes change
// childtree observer handles looking for unbound child elements

// to be called by user
function bind(rootNode, registerObserver = true) {
  let targetSelector = [
    '[data-bind-attribute]',
    '[data-bind-property]',
    '[data-bind-event]',
    'template[data-bind-render-if]',
    'template[data-bind-render-for]',
    'template[data-bind-render]'
    // [data-bind-handler]
  ].join(', ')

  if (rootNode.matches(targetSelector)) {
    bindElement(rootNode)
  }
  for (let target of rootNode.querySelectorAll(targetSelector)) {
    bindElement(target)
  }

  // TODO: edge case handling: bind an el, unbind it, and bind a subsection
  let skipMutationObserver = !registerObserver || isObserved(rootNode)
  if (skipMutationObserver) {
    return
  }

  _observer.observe(rootNode, {
    attributes: true, 
    childList: true, 
    subtree: true,
    attributeOldValue: false,
    characterDataOldValue: false, 
    attributeFilter: [
      'data-bind-scope',
      'data-bind-attribute',
      'data-bind-property',
      'data-bind-event',
      'data-bind-render-if',
      'data-bind-render-for'
    ]
  })
  
  isObserved(rootNode, true)
}

let _observer = new MutationObserver((mutationsList, observer) => {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      for (let addedNode of mutation.addedNodes) {
        bind(addedNode, false)
      }
    } else if (mutation.type === "attributes") {
      let attrBindingMap = {
        // TODO revist all this
        ['data-bind-scope']: bindScope,
        ['data-bind-attribute']: bindAttribute,
        ['data-bind-property']: bindProperty,
        ['data-bind-event']: bindEvent,
        ['data-bind-render-if']: bindTemplateRenderIf,
        ['data-bind-render-for']: bindTemplateRenderFor
      }

      attrBindingMap[mutation.type](mutation.target)
    }
    // no support for mutation.type === "characterData"
  }
})

function isObserved(el, setValue) {
  if (setValue !== undefined) {
    el[Symbol.for('data-bind-observer-registered')] = true
  }

  if (!el) {
    return false
  }

  if (el[Symbol.for('data-bind-observer-registered')]) {
    return true
  }

  return isObserved(el.parentNode)
}

var _elMetadata = new WeakMap()
function getElMetadata(el) {
  let elMetadata = _elMetadata.get(el)
  if (!elMetadata) {
    elMetadata = {}
    _elMetadata.set(el, elMetadata)
  }
}

// TODO where do i check to make sure it's not harmful/reduntant/wasteful to run this?
function bindElement(el) {
  if (!el.isConnected) {
    // TODO can this be removed?
    console.warn('attempted to bind disconnected element')
    return
  }

  bindScope(el)
  bindAttribute(el)
  bindProperty(el)
  bindTemplateRenderIf(el)
  bindTemplateRenderFor(el)
}

// need a method to re-evaluate child scope caches, indicate which 
