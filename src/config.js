import { p_home } from "./page/p_home.js";
import { p_index } from "./page/p_index.js";
import { p_intro } from "./page/p_intro.js";
import { p_introA } from "./page/p_introA.js";
import { p_introB } from "./page/p_introB.js";

// ❤️ 新專案注意事項
// src/config.js router ＆ store 內容皆可刪
// src/core 內的程式碼不要動
// src/custom 內 ui.js 可以更改樣式，想自己刻 ui 可以自己新增 yourUiName.js
// src/page 下全刪沒問題

export const config = {
    router: {
        // 'pageId': { page: your jsdom template, default: 'default sub router path' }
        // ❤️ 新專案可清空
        'index': { dom_tpl: p_index, default: 'index/home' },
        'index/home': { dom_tpl: p_home },
        'index/intro': { dom_tpl: p_intro, default: 'index/intro/pageA' },
        'index/intro/pageA': { dom_tpl: p_introA },
        'index/intro/pageB': { dom_tpl: p_introB },
    },
    store: {
        // do not use node.proxy function in store object properties, it's only store primitive value
        // there are only two types of data, single value and array
        // ❤️ 新專案可清空
        p_index: {
            featureList: [
                '適用於 webapp 開發 / 行銷落地頁面 / 形象官網',
                '學習曲線低的可愛，無復雜的 api 需要學習',
                '透過 MVVM 設計，簡化開發困難度',
                '可以整合 tailwind 與其他 css 框架',
                '與傳統 html 差別在標籤生成全在 js 裡完成',
                '不需要管生命週期',
                '強大的可覆用模組通用設計方式',
                '程式碼不用編譯即可直接預覽',
                '依需要可使用 webpack 壓縮與混淆程式碼',
                'node.xxx().on 註冊的方法會在切換頁面時貼心自動釋放',
                'node.xxx API 提供基礎 ui 與常用函式',
                'ui.xxx API 提供高級 ui 且可輕鬆自定義樣式',
                'router 設計簡單直覺，src/config.js 進行設定',
                'store 用於管理全域資料，且畫面切換資料不會消失，通常會配合 node.proxy 使用，src/config.js 進行設定',
                '不同層級的元件溝通簡單，僅需 getPageNodes 物件全取 or getPageNodeById 取單一物件',
            ]
        },
        p_introA: {
            // use vm_list with array
            fruit: [{ fruit: 'apple', price: 10 }, { fruit: 'orange', price: 5 }, { fruit: 'banana', price: 7 }],
            // use vm_single with - single value (string or number)
            single: 'time: ' + Date.now(),

        },
        p_introB: {
            uiColor: 'black',
            textAreaTest: 'enter somethings here'
        }
    }
}