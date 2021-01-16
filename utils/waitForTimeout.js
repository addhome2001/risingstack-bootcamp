'use strict'

const waitForTimeout = (m) =>
  new Promise((_, reject) => {
    setTimeout(() => {
      reject()
    }, m)
  })

module.exports = waitForTimeout
