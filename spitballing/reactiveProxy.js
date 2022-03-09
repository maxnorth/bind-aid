const target = {
  message1: "hello",
  message2: "everyone"
};

const handler2 = {
  get(target, prop, receiver) {
    return "world";
  }
};

const proxy2 = new Proxy(target, handler2);

// it takes an object
// the getter returns the value wrapped in another proxy, if it is an object
//

function proxyGetter(target, prop) {
  let value = target[prop]
  // TODO improve
  if (typeof value === 'object') {
    return createProxy(value, )
  }
}

function proxySetter(target, prop, value) {

}

function createProxy(target, updateCallback) {
  return new Proxy(target, {
    get(target, prop) {
      let value = target[prop]
      // TODO improve
      if (typeof value === 'object') {
        return createProxy(value, updateCallback)
      }
      return value
    },
    set(target, prop, value) {
      target[prop] = value
      updateCallback()
    }
  })
}