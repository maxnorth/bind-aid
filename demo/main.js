window.addEventListener('load', async () => {
  bind(document.body.getRootNode())
})

document.querySelector('[data-bind-scope="todo"]').scope = {}