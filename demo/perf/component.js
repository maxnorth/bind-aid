customElements.define('perf-test', class extends HTMLElement { 
  #scope;
  
  constructor() {
    super()
    
    let shadowRoot = this.attachShadow({mode: 'closed'})

    let scope = this.#scope = Observable({
      selected: null,
      rows: [],
      setRows(update = scope.rows.slice()) {
        scope.rows = update
      },
      add() {
        scope.rows = scope.rows.concat(buildData(1000))
      },
      remove(id) {
        // TODO debug
        scope.rows.splice(
          scope.rows.findIndex((d) => d.id === id)._,
          1
        )
        scope.setRows()
      },
      select(id) {
        scope.selected = id
      },
      run() {
        scope.setRows(buildData())
        scope.selected = undefined
      },
      update() {
        const _rows = scope.rows
        for (let i = 0; i < _rows.length; i += 10) {
          _rows[i].label += ' !!!'
        }
        scope.setRows()
      },
      runLots() {
        scope.setRows(buildData(10000))
        scope.selected = undefined
      },
      clear() {
        scope.setRows([])
        scope.selected = undefined
      },
      swapRows() {
        const _rows = scope.rows
        if (_rows.length > 998) {
          const d1 = _rows[1]
          const d998 = _rows[998]
          _rows[1] = d998
          _rows[998] = d1
          scope.setRows()
        }
      }
    })

    shadowRoot.innerHTML = /*html*/`
      <template data-bind-render data-bind-scope="app">
        <div class="jumbotron">
          <div class="row">
            <div class="col-md-6">
              <h1>bind-aid (non-keyed)</h1>
            </div>
            <div class="col-md-6">
              <div class="row">
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    id="run"
                    data-bind-event="click: app.run"
                  >
                    Create 1,000 rows
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    id="runlots"
                    data-bind-event="click: app.runLots"
                  >
                    Create 10,000 rows
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    id="add"
                    data-bind-event="click: app.add"
                  >
                    Append 1,000 rows
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    id="update"
                    data-bind-event="click: app.update"
                  >
                    Update every 10th row
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    id="clear"
                    data-bind-event="click: app.clear"
                  >
                    Clear
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    id="swaprows"
                    data-bind-event="click: app.swapRows"
                  >
                    Swap Rows
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <table class="table table-hover table-striped test-data">
          <tbody>
            <template data-bind-render-for="row of app.rows">
              <tr data-bind-attribute="
                class: (row.id === app.selected) ? 'danger' : '',
                'data-label': row.label
              ">
              <td class="col-md-1" data-bind-property="innerText: row.id"></td>
              <td class="col-md-4">
                <a data-bind-even="click: app.select(row.id)" data-bind-property="innerText: row.label"></a>
              </td>
              <td class="col-md-1">
                <a data-bind-event="click() { app.remove(row.id) }">
                  <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </a>
              </td>
              <td class="col-md-6"></td>
            </tr>
            </template>
          </tbody>
        </table>
        <span
          class="preloadicon glyphicon glyphicon-remove"
          aria-hidden="true"
        ></span>
      </template>
    `
    
    shadowRoot.querySelector('template[data-bind-scope]').scope = this.#scope
    bind(shadowRoot)
  }
})

let ID = 1

function _random(max) {
  return Math.round(Math.random() * 1000) % max
}

function buildData(count = 1000) {
  const adjectives = [
    'pretty',
    'large',
    'big',
    'small',
    'tall',
    'short',
    'long',
    'handsome',
    'plain',
    'quaint',
    'clean',
    'elegant',
    'easy',
    'angry',
    'crazy',
    'helpful',
    'mushy',
    'odd',
    'unsightly',
    'adorable',
    'important',
    'inexpensive',
    'cheap',
    'expensive',
    'fancy'
  ]
  const colours = [
    'red',
    'yellow',
    'blue',
    'green',
    'pink',
    'brown',
    'purple',
    'brown',
    'white',
    'black',
    'orange'
  ]
  const nouns = [
    'table',
    'chair',
    'house',
    'bbq',
    'desk',
    'car',
    'pony',
    'cookie',
    'sandwich',
    'burger',
    'pizza',
    'mouse',
    'keyboard'
  ]
  const data = []
  for (let i = 0; i < count; i++)
    data.push({
      id: ID++,
      label:
        adjectives[_random(adjectives.length)] +
        ' ' +
        colours[_random(colours.length)] +
        ' ' +
        nouns[_random(nouns.length)]
    })
  return data
}