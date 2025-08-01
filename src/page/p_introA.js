import { node } from "../core/node.js"
import { store } from "../core/store.js"

export const p_introA = () => {

    // custom css class
    const wowBtn = 'bg-cyan-500 inline-flex p-2 cursor-pointer hover:bg-black m-1 rounded-sm'

    // custom css style
    let style_hi = { width: '100vw', height: '100vh', background: 'rgba(110, 53, 0, 0.5)', fontSize: '24px', padding: '10px' }

    // ViewModel item template and datas
    const vmItemTemplate = (item, index) => node.div().setText(index + ' listItem ' + item.fruit + ' price $' + item.price).setClass('p-1 m-1 bg-[#337733]')
    const vmItemTemplate2 = (item, index) => node.div().setText(index + ' listItem ' + item.fruit + ' price $' + item.price).setClass('p-1 m-1 bg-[#AA3333]')
    const singleItemTemplate = (item) => node.div().setText(item).setClass('p-1 m-1 bg-[#CCAA33]')
    const vmItemData = node.proxy(store.data.p_introA.fruit)
    const oneItemData = node.proxy(store.data.p_introA.single)

    // UI DOM Build
    let jsdom = node.div('hiA').setStyle(style_hi).setChildren([
        node.span('sub').setText('Tab A - MVVM test'),
        node.div().setText('🟢------single vm----- single data, single view'),
        node.button('updateOne', 'update single item', wowBtn),
        node.vm_single('oneItem', singleItemTemplate, oneItemData),
        node.div().setText('🟢------many vms----- same data, different view'),
        node.button('push', 'push', wowBtn),
        node.button('pop', 'pop', wowBtn),
        node.button('shift', 'shift', wowBtn),
        node.button('unshift', 'unshift', wowBtn),
        node.button('removeAt', 'removeAt1', wowBtn),
        node.button('addAt', 'addAt1', wowBtn),
        node.button('replaceAt', 'replaceAt1', wowBtn),
        node.button('reverse', 'reverse', wowBtn),
        node.button('sort', 'sort', wowBtn),
        node.button('clear', 'clear', wowBtn),
        node.button('fetch', 'fetch', wowBtn),
        node.vm_list('vm', vmItemTemplate, vmItemData),
        node.vm_list('vm2', vmItemTemplate2, vmItemData),
    ])

    // UI Interaction
    jsdom.getChildById('push').on('click', _ => {
        vmItemData.push({ fruit: 'push', price: 111 })
    })
    jsdom.getChildById('pop').on('click', _ => {
        vmItemData.pop()
    })
    jsdom.getChildById('shift').on('click', _ => {
        vmItemData.shift()
    })
    jsdom.getChildById('unshift').on('click', _ => {
        vmItemData.unshift({ fruit: 'unshift', price: 50 })
    })
    jsdom.getChildById('removeAt').on('click', _ => {
        vmItemData.splice(1, 1)
    })
    jsdom.getChildById('addAt').on('click', _ => {
        vmItemData.splice(1, 0, { fruit: 'wow', price: 99 })
    })
    jsdom.getChildById('replaceAt').on('click', _ => {
        vmItemData[1] = { fruit: 'seafood', price: 100 }
    })
    jsdom.getChildById('reverse').on('click', _ => {
        vmItemData.reverse()
    })
    jsdom.getChildById('sort').on('click', _ => {
        vmItemData.sort((a, b) => b.price - a.price)
    })
    jsdom.getChildById('clear').on('click', _ => {
        vmItemData.length = 0
    })
    jsdom.getChildById('updateOne').on('click', _ => {
        oneItemData[0] = 'time: ' + Date.now() // single value use [0] to set or get value
    })
    jsdom.getChildById('fetch').on('click', _ => {
        store.fetch('https://localhost/api', vmItemData, true) // append data
    })

    // on enter page, when no data, auto fetch data
    if (vmItemData.length == 0)
        store.fetch('https://localhost/api', vmItemData, false)

    return jsdom
}