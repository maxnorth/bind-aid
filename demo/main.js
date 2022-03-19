window.addEventListener('load', async () => {
  document.querySelector('[data-bind-scope="todo"]').scope = {
    classes: 'test'
  }
  
  bind(document.body.parentElement)

  await asyncTimeout(3000)

  document.querySelector('[data-bind-scope="todo"]').scope = {
    classes: 'hm'
  }
})