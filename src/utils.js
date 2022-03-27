function asyncTimeout(delay) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      resolve(timeoutId)
    }, delay)
  })
}

window.asyncTimeout = asyncTimeout