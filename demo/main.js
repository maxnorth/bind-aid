window.addEventListener('load', async () => {
  document.querySelector('[data-bind-scope="todo"]').scope = {
    classes: 'test',
    items: [
      {
        name: 'asdasd',
        type: 'reminder'
      },
      {
        name: 'bleh',
        type: 'reminder'
      },
      {
        name: 'hm',
        type: 'hm'
      }
    ]
  }
  
  bind(document.body.parentElement)

  await asyncTimeout(3000)

  document.querySelector('[data-bind-scope="todo"]').scope.classes = 'test'
  document.querySelector('[data-bind-scope="todo"]').scope.items = [
    {
      name: 'bleh',
      type: 'reminder'
    },
    {
      name: 'hm',
      type: 'hm'
    }
  ]
})