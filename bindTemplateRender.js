
function bindTemplateRender() {

}

function bindTemplateRenderIf() {
  // bind render condition and subscribe to changes
}

function bindTemplateRenderFor() {
  // bind template children and subscribe to changes

  // weakmap!!! use this for element references

  // how to limit amount of rebinding needed when element gets attached back to the DOM (it may be out of date)
}

// templates get a separate mutation observer i think

// adding or changing any attribute doesn't have to be highly performant. these won't happen in a regular app.
// reacting to data changes *does* have to be highly performant


// weakmap as alternative to symbol prop?
