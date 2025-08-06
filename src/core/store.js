// store 用於管理全域資料，且畫面切換資料不會消失

import { config } from "../config.js"

export const store = {
    init() {
        let storeData = this.getStoreData()
        if (storeData) {
            store.data = deepCheck(JSON.parse(storeData))
        } else
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
    },
    saveStore() {
        let save = {}
        restore(JSON.parse(JSON.stringify(store.data)), null, null, save)
        localStorage.setItem('chill.js', JSON.stringify(save))
    },
    clearStore() {
        localStorage.removeItem('chill.js')
    },
    getStoreData() {
        return localStorage.getItem('chill.js')
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

// restore data
function restore(obj, parent, key, restoreData, restoreDataParent) {
    if (obj === null || typeof obj !== 'object') {
        // console.log('not array here', obj, parent, key)
        return obj
    }
    if (Array.isArray(obj) && Array.length) {
        // console.log('array', obj)
        if (obj.length == 1 && (typeof obj[0] == 'number' || typeof obj[0] == 'string')) {
            restoreDataParent[key] = restoreData[0]
            // console.log(restoreDataParent, restoreData, key)
        }
    } else {
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                restoreData[key] = obj[key]
                restore(obj[key], obj, key, restoreData[key], restoreData)
            }
        }
    }
}

