import { node } from "../core/node.js"
import { store } from "../core/store.js"
import { ui } from "../custom/ui.js"

export const p_introB = () => {

    // custom css style
    let style_hi = { width: '100vw', background: 'rgba(9, 81, 71, 0.56)', fontSize: '24px', padding: '10px' }

    // ViewModel datas
    const oneItemTemplate = (item) => node.div().setText(item).setClass('p-1 m-1 bg-[#CCAA33]')
    const oneItemData = node.proxy(store.data.p_introB.textAreaTest)

    // UI DOM Build
    let jsdom = node.div('hiB').setStyle(style_hi).setChildren([
        node.span('sub').setText('Tab B'),
        node.div().setChildren([
            node.div().setText('🟢------dialogs----- '),
            ui.button('alert', 'alert'),
            ui.button('confirm', 'confirm'),
            ui.button('date', 'datePicker'),
            node.div().setText('🟢------node----- '),
            ui.button('all', 'all nodes log in console panel'),
            node.div().setText('🟢------input test----- '),
            node.vm_textarea('textarea', oneItemData).setClass('bg-[#666] border-5').setPlaceholder('this is textarea'),
            node.vm_single('', oneItemTemplate, oneItemData),
            node.vm_input('textInput', oneItemData, 'text').setClass('bg-[#666] border-5').setPlaceholder('this is text input'),
            ui.button('text', 'text'),
            ui.button('password', 'password'),
            ui.file('file', 'select file', 2, result => oneItemData[0] = result),
            node.div().setText('🟢------img----- '),
            node.img('testimg').setSrc('sample.png'),
        ])
    ])

    // UI Interaction
    let textInput = jsdom.getChildById('textInput')
    jsdom.getChildById('text').on('click', () => {
        textInput.setType('text')
    })
    jsdom.getChildById('password').on('click', () => {
        textInput.setType('password')
    })
    jsdom.getChildById('alert').on('click', () => {
        ui.alert('This is alert window', '350px', '150px', result => console.log(result))
    })
    jsdom.getChildById('confirm').on('click', () => {
        ui.confirm('This is confirm window', '350px', '150px', result => console.log(result))
    })
    jsdom.getChildById('date').on('click', (e, t) => {
        ui.date(result => t.setText(result))
    })

    // 不同層級元件溝通
    jsdom.getChildById('all').on('click', () => {
        // 用以觀察目前頁面的所有有設定 tag id 的物件
        console.log(node.getPageNodes())
        // ❤️ node.getPageNodeById 只能在 jsdom 建立完成才會生效。node.getPageNodeById 會比 node.app().getChildById 來得高效
        node.getPageNodeById('navBar').setStyle({ background: '#353552ff' })
    })

    // ❤️ node.getPageNodeById 會執行失敗 ❌，因為 jsdom 正建立中，尚未加到 dom 裡
    // node.getPageNodeById('navBar').setStyle({ background: 'deeppink' }) 

    // ❤️ 下面會成功，因為是下一次觸發渲染才會跑，而在渲染前 jsdom 已經建立完畢
    // requestAnimationFrame(() => {
    //     node.getPageNodeById('navBar').setStyle({ background: 'green' })
    // })

    return jsdom
}