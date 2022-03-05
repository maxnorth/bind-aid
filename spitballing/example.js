<div>
  <h1 data-bind-scope="test">
    <div 
      data-bind-attribute="
        class: 'country city town ' + test.colors
      "
      data-bind-property="
        innerText: test.userName, 
        something: 34
      "
      data-bind-event="
        input: (e) => test.userName = parse(e.value)
      "
      data-bind-render-for="address of test.addresses"
      data-bind-render-if=""
    >
    </div>
  </h1>
</div>

h1.scope.test = { colors: 'red', userName: 'John' }

// use cases
// forms
// repeat - not handled