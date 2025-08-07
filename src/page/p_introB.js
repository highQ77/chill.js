import { node } from "../core/node.js"
import { store } from "../core/store.js"
import { ui } from "../custom/ui.js"

export const p_introB = () => {

    // custom css style
    let style_hi = { width: '100vw', minHeight: 'calc(100dvh - 150px)', background: '#000000', padding: '10px' }

    // ViewModel datas
    const oneItemTemplate = (item) => node.div().setText(item).setClass('p-1 m-1 bg-[#CCAA33]')
    const oneItemData = node.proxy(store.data.p_introB.textAreaTest)
    const vmSelectItemTemplate = (item, idx) => {
        let icon = '🐷'
        if (idx == 0) icon = '🥇'
        if (idx == 1) icon = '🥈'
        if (idx == 2) icon = '🥉'
        return node.div().setClass('hover:bg-[#33333366] cursor-pointer')
            .setStyle({ borderTop: '1px solid #99999966', padding: '5px' })
            .setText(icon + ' ' + item)
    }
    const vmSelectItemDatas = node.proxy(['好好', '好棒', '好累', '好神', '好運', '好開心', '好朋友', '好神奇', ...Array(10).fill(0).map((i, idx) => idx.toString())])
    const vmRadioDatas = node.proxy(Array(10).fill(0).map((i, idx) => 'radio ' + idx.toString()))
    const vmCheckboxDatas = node.proxy(Array(10).fill(0).map((i, idx) => 'checkbox ' + idx.toString()))

    const vmPagerDataView = (item, idx) => node.div().setText(item).setClass('p-1 m-1 bg-[#666]')
    const vmPagerDatas = node.proxy(Array(66).fill(0).map((i, idx) => 'pager ' + idx.toString()))


    // UI DOM Build
    let jsdom = node.div().setStyle(style_hi).setChildren([
        node.span('sub').setText('Misc.').setClass('text-3xl'),
        node.div().setChildren([
            node.hr(),
            node.div().setText('dialogs'),
            ui.button('alert', 'alert'),
            ui.button('confirm', 'confirm'),
            ui.button('date', 'datePicker'),
            ui.button('color', 'colorPicker'),
            node.hr(),
            node.div().setText('store data - you can save MVVM & colorPicker state'),
            ui.button('save', 'save store'),
            ui.button('clear', 'clear store'),
            node.hr(),
            node.div().setText('node'),
            ui.button('all', 'all nodes log in console panel'),
            node.hr(),
            node.div().setText('input'),
            node.vm_textarea('textarea', oneItemData).setClass('bg-black p-2 border-1 border-[springgreen] rounded-sm').setPlaceholder('this is textarea'),
            node.vm_single('', oneItemTemplate, oneItemData),
            node.vm_input('textInput', oneItemData, 'text').setClass('bg-black p-2 mr-2 border-1 border-[springgreen] rounded-sm').setPlaceholder('this is text input'),
            ui.button('text', 'text'),
            ui.button('password', 'password'),
            ui.file('file', 'select file', 2, result => oneItemData[0] = result),
            ui.vm_select('select', 'menu', vmSelectItemTemplate, vmSelectItemDatas, (item) => '').setStyle({ marginTop: '3px' }),
            node.div().setText('radio buttons').setStyle({ padding: '20px 0', color: '#666' }),
            ui.layoutH(node.vm_radio('radio', vmRadioDatas, 'springgreen', d => console.log(d)), 6),
            node.div().setText('checkbox buttons').setStyle({ padding: '20px 0', color: '#666' }),
            ui.layoutH(node.vm_checkbox('checkbox', vmCheckboxDatas, 'springgreen', d => console.log(d)), 6),
            node.hr(),
            node.div().setText('image'),
            node.scroller('featuresScroller', '200px', '200px', 'springgreen', '#333', '-10px', '3px', node.img('testimg').setSrc('sample.png').setClass('rounded-sm').setStyle({ width: '500px', height: '500px' }), 2),
            node.hr(),
            node.div().setText('pager'),
            node.pager('pager', vmPagerDatas, node.vm_list('pagerData', vmPagerDataView, vmPagerDatas), 9)
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
        ui.date(result => result && t.setText(result))
    })
    jsdom.getChildById('color').on('click', (e, t) => {
        ui.color(color => {
            node.pubsub.publish('changeSubNavBG', `rgb(${color.r}, ${color.g},${color.b})`)
        })
    })
    jsdom.getChildById('save').on('click', () => {
        ui.alert('Store Data Saved', '350px', '150px', result => store.saveStore())
    })
    jsdom.getChildById('clear').on('click', () => {
        ui.alert('Store Data Cleared', '350px', '150px', result => store.clearStore())
    })

    // 不同層級元件溝通
    jsdom.getChildById('all').on('click', () => {
        // 用以觀察目前頁面的所有有設定 tag id 的物件
        console.log(node.getPageNodes())
        ui.alert('please check developer console', '350px', '150px', result => console.log(result))
    })

    // ❤️ node.getPageNodeById or getPageNodes 只能在 jsdom 建立完成才會生效。node.getPageNodeById 會比 node.app().getChildById 來得高效

    // ❤️ node.getPageNodeById 會執行失敗，因為 jsdom 正建立中，尚未加到 dom 裡
    // node.getPageNodeById('navBar').setStyle({ background: 'deeppink' }) // ❌

    // ❤️ 下面會成功，因為是下一次觸發渲染才會跑，而在渲染前 jsdom 已經建立完畢
    // requestAnimationFrame(() => {
    //     node.getPageNodeById('navBar').setStyle({ background: 'orange' })
    // })

    return jsdom
}