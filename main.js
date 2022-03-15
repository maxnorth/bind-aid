
document.querySelector('[data-bind-scope=todo]').scope = createProxy({ 
  classes: 'test', 
  userInput: 'bleh', 
  items: [
    {name: 'john', type: 'reminder'}, 
    {name: 'eric', type: 'reminder2'}
  ] 
}, applyScopeAsync)