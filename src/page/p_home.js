import { node } from "../core/node.js"

export const p_home = () => {

    // UI DOM Build
    let jsdom = node.div('hi').setClass('h-[600px] bg-[#333] flex items-center').setChildren([
        node.div('sub').setStyle({ paddingLeft: '50px' }).setChildren([
            node.div().setText('歡迎使用 chill.js 超簡單 SPA ( single page application ) 框架'),
            node.div().setClass('text-[yellowgreen]').setText(' easy all-in-one ( jsdom / mvvm / store / router ) javascript framework'),
            node.div().setText('🟠 src / config.js 進行 router 與 store 設定'),
            node.div().setText('🟠 src / page 下新增頁面 '),
            node.div().setText('🟠 node.app 取得 app 物件'),
            node.div().setText('🟠 node.div 適合介面板塊設計'),
            node.div().setText('🟠 node.span 適合文字區塊設計'),
            node.div().setText('🟠 node.img 圖片'),
            node.div().setText('🟠 node.button router 按鈕或一般按鈕'),
            node.div().setText('🟠 node.file 檔案選取器'),
            node.div().setText('🟠 node.vm_input 輸入物件，為 MVVM，資料為 proxy'),
            node.div().setText('🟠 node.vm_textarea 輸入物件，為 MVVM，資料為 proxy'),
            node.div().setText('🟠 node.vm_list MVVM 列表 (extends node.div)，資料為 proxy'),
            node.div().setText('🟠 node.vm_single MVVM 單一物件 (extends node.div)，資料為 proxy'),
            node.div().setText('🟡 node.proxy 資料轉為 MVVM 模式'),
        ])
    ])

    // UI Interaction
    // ...

    return jsdom
}