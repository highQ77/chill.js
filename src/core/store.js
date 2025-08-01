// store 用於管理全域資料，且畫面切換資料不會消失

import { config } from "../config.js"

export const store = {
    init() {
        store.data = deepCheck(config.store)
    },
    fetch(url, proxyData, isAppend) { // mode - append or replace
        // 🟣
        // fetch(url).then(r => r.json()).then(obj => {
        //     proxyData.length = 0
        // })
        if (url == 'https://localhost/api') {
            let data = [{ fruit: 'fetch1', price: 11 }, { fruit: 'fetch2', price: 12 }]
            setTimeout(() => {
                if (!isAppend)
                    proxyData.length = 0
                while (data.length)
                    proxyData.push(data.shift())
            }, 200)
        }
    }
}

// auto change single value into array with only one element
function deepCheck(obj, parent, key) {
    if (obj === null || typeof obj !== 'object') {
        // console.log('not array here', obj, parent, key)
        parent[key] = [obj]
        return obj
    }
    if (Array.isArray(obj) && Array.length) {
        // console.log('array', obj)
    } else {
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                deepCheck(obj[key], obj, key)
            }
        }
    }
    return obj
}

