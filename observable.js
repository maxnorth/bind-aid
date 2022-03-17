let _subStore = {}
function Observable(target) {
  let _subProxies = {}
  let _listeningSubId = null
  let _propertySubs = {}
  let $ = {
    subscribe(expression, callback) {
      let subId = Symbol()
      _subStore[subId] = { expression, callback, proxy }

      setTimeout(() => $.evaluateAndListen(subId))

      return subId
    },
    unsubscribe(subId) {
      delete _subStore[subId]
    },
    setListeningSubscription(subId) {
      if (_listeningSubId && subId) {
        throw "A subscription is already listening on this proxy"
      }
      // when the listener gets removed
      if (_listeningSubId && !subId) {
        for (let subProxy of Object.values(_subProxies)) {
          subProxy.$.setListeningSubscription(null)
        }
      }
      _listeningSubId = subId
    },
    evaluateAndListen(subId) {
      let { expression } = _subStore[subId]
      if (!subId) {
        console.warn('Invalid subscription id passed to evaluateAndListen')
        return
      }

      try {
        $.setListeningSubscription(subId)
        expression(proxy)          
      } finally {
        $.setListeningSubscription(null)
      }
    }
  }

  let proxy = new Proxy(target, {
    get(target, prop) {
      if (prop === '_') {
        return target
      }
      if (prop === '$') {
        return $
      }
      if (_listeningSubId) {
        // register listening subscription for callbacks
        _propertySubs[prop] = _propertySubs[prop] || new Set()
        _propertySubs[prop].add(_listeningSubId)
      }
      let value = target[prop]
      if (typeof value === 'object' && value !== null) {
        let subProxy = _subProxies[prop] = _subProxies[prop] || Observable(value)
        subProxy.$.setListeningSubscription(_listeningSubId)
        return subProxy
      }
      return value
    },
    set(target, prop, value) {
      value = (value && value._) || value

      let changed = target[prop] !== value
      // ultimately you'd want to set the cached proxy too i think
      target[prop] = value

      if (changed) {
        delete _subProxies[prop]
      }

      let propertySubIds = _propertySubs[prop]
      for (let subId of propertySubIds || []) {
        let subDef = _subStore[subId]
        if (subDef) {
          // i could probably combine these for non-redundant evaluation
          setTimeout(() => subDef.callback(subDef.expression(subDef.proxy)))
          setTimeout(() => subDef.proxy.$.evaluateAndListen(subId))
        }
      }
      return true
    }
  })

  return proxy
}

// if any sets occur on the child objects, trigger subscribers
// tie an expression to subscribers
// when those specific fields
// subscribe to a specific set of fields/values. so, that specific evaluation chain
// each proxy generated during a get
// create a map within a proxy of subscribers to specific fields, these get called back whenever that field gets set, and all child instances get 


// proxy maintains a map of property names. each time a getter accesses a field, it instantiates a child proxy and registers callbacks associated to that value
// any time that field is set, it invokes all the child proxies and invalidates them. it also registers the new listeners

// the proxy evaluation 

// each object needs to know it's parent(s)

// wait - it's just a context. anything fetched via a getter must use this callback if it changes
// and there's also collection level ones - if other props change, it needs to change. implemented in certain traps

// a proxy has 
// - parent bindings
// - 

// when property x changes, let me know
// when property y of property x changes, let me know

// pass in subscribed properties 

// one level deep, predefined prop list, single subscriber

// nesting levels, prop inference, multi-subscriber

