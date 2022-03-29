// will subscriptions prevent elements from being GC'd?
// TODO prototype subscription linking
let _objSubMap = new WeakMap()
let _objProxyMap = new WeakMap()
let _subStore = {}
let _listeningSubId = null
function Observable(target) {
  let _proxyProto = null
  let $ = {
    subscribe(expression, callback) {
      let subId = Symbol()
      _subStore[subId] = { expression, callback, proxy }

      $.evaluateAndListen(subId)

      return subId
    },
    unsubscribe(subId) {
      delete _subStore[subId]
    },
    evaluateAndListen(subId) {
      let subDef = _subStore[subId]
      if (!subDef) {
        // TODO: warn? is there a valid scenario for this?
        return
      }
      let { expression } = subDef

      if (!subId) {
        console.warn('Invalid subscription id passed to evaluateAndListen')
        return
      }

      try {
        $.setListeningSubscription(subId)
        return expression(proxy)          
      } finally {
        $.setListeningSubscription(null)
      }
    },
    setListeningSubscription(subId) {
      if (_listeningSubId && subId && _listeningSubId !== subId) {
        throw "A subscription is already listening on this proxy"
      }
      _listeningSubId = subId
    },
    inherit(protoProxy) {
      _proxyProto = protoProxy
    }
  }

  let proxy = new Proxy(target, {
    // why is target sometimes a proxy?
    get(target, prop) {
      // console.warn('hit')
      if (prop === '_') {
        return target
      }
      if (prop === '$') {
        return $
      }
      let value = target[prop]
      if (!value && _proxyProto && !Reflect.has(target, prop)) {
        return _proxyProto[prop]
      }
      if (_listeningSubId) {
        // register listening subscription for callbacks
        let propertySubs = _objSubMap.get(target)
        if (!propertySubs) {
          propertySubs = {}
          Object.setPrototypeOf(propertySubs, null)
          _objSubMap.set(target, propertySubs)
        }
        propertySubs[prop] = propertySubs[prop] || new Set()
        propertySubs[prop].add(_listeningSubId)
      }
      if (typeof value === 'object' && value !== null) {
        // TODO, ensure value is a non-proxy
        let valueProxy = _objProxyMap.get(value)
        if (!valueProxy) {
          valueProxy = Observable(value)
          _objProxyMap.set(value, valueProxy)
        }
        return valueProxy
      }
      return value
    },
    set(target, prop, value) {
      // console.info('set')
      value = value?._ || value

      target[prop] = value

      let propertySubs = _objSubMap.get(target)
      if (propertySubs) {
        for (let subId of propertySubs[prop] || []) {
          let subDef = _subStore[subId]
          if (subDef) {
            // i could probably combine these for non-redundant evaluation
            setTimeout(() => subDef.callback(subDef.expression(subDef.proxy)))
            setTimeout(() => subDef.proxy.$.evaluateAndListen(subId)) // could this return the value to use above?
          }
        }
      }
      return true
    },
    ownKeys(target) {
      let proxyKeys = _proxyProto ? Reflect.ownKeys(_proxyProto) : []
      let targetKeys = Reflect.ownKeys(target)
      let keys = [...new Set(proxyKeys.concat(targetKeys))]
            
      return keys
    },
    has(target, key) {
      return key === '$' 
          || key === '_' 
          || Reflect.has(target, key) 
          || _proxyProto && Reflect.has(_proxyProto, key)
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


window.Observable = Observable