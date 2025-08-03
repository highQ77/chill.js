import { node } from "../core/node.js"
import { store } from "../core/store.js"
import { ui } from "../custom/ui.js"

export const p_home = () => {

    // ViewModel datas
    const itemsTemplate = (item, index) => node.div().setClass('col-span-3 md:col-span-1 p-2 mt-1 mr-1 border-b-1 border-[darkgreen] hover:border-[orange] min-h-[60px] rounded-sm bg-[#00000099]').setText('🥇 ' + item)
    const itemsData = node.proxy(store.data.p_index.featureList)

    // UI DOM Build
    let jsdom = node.divimg('', 'swril.jpg').setClass('h-[600px] flex items-end pb-[30px]').setStyle({ minHeight: 'calc(100vh - 102px)' }).setChildren([
        node.div().setClass('bg-[#00000099] backdrop-blur-sm p-5 h-[550px] overflow-hidden').setChildren([
            node.h('', 1).setClass('text-3xl').setText('歡迎使用 chill.js 超簡單 SPA 框架'),
            node.div().setClass('text-[springgreen]').setText(' easy all-in-one ( jsdom / mvvm / store / router ) javascript framework'),
            node.div().setText('適用於 web 單頁應用程式開發'),
            node.div().setText('features').setClass('text-2xl').setStyle({ marginTop: '30px' }),
            node.div().setClass('overflow-auto h-[335px]').setChildren([
                ui.layoutH(node.vm_list('features', itemsTemplate, itemsData), 3)
            ])
        ]),
    ])

    return jsdom
}