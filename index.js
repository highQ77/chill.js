import { node } from "./src/core/node.js";
import { router } from "./src/core/router.js";
import { store } from "./src/core/store.js";

// 作者 梁紘謙 William77 (威廉) 2025/07/31

// [todo]
// 🟣 store fetch data 功能開發 (目前是假資料)
// 🟣 essential ui component: dialog(alert/confirm) / date? / time? / date time? / color?

// [intro]
// ✅ 有鑒於現代前端框架複雜度劇增，個人希望能開發出簡單易學且能快速開發的框架
// ✅ 本引擎仍在開發中，為個人趣味研究，不完整的地方，請多多包涵與指教

// [features]
// ✅ 學習曲線低
// ✅ 與傳統 html 差別在標籤生成全在 js 裡完成
// ✅ 程式碼不用編譯即可直接預覽（推薦使用 VSCode Live Server）
// ✅ 支援程式碼提示可參考 src/core/node.js 的 API
// ✅ 無需 UI 模板，直接用 js 打造 dom 樹
// ✅ 模組化與封裝元件範例如 src/ui/uibutton.js
// ✅ 不同層級的元件溝通簡單，僅需 getChildById 取物件
// ✅ 可以整合 tailwind 與其他 css 框架
// ✅ router 設計簡單直覺，可參考 src/core/router.js 的 API
// ✅ store 用於管理全域資料，且畫面切換資料不會消失，通常會配合 node.proxy 使用
// ✅ 透過 MVVM 設計，簡化開發困難度

// [tips]
// 🟠 src / config.js 進行 router 與 store 設定
// 🟠 src / page 下新增頁面 
// 🟠 node.app 取得 app 物件
// 🟠 node.div 適合介面板塊設計
// 🟠 node.span 適合文字區塊設計
// 🟠 node.img 圖片
// 🟠 node.button router 按鈕或一般按鈕
// 🟠 node.vm_input 輸入物件
// 🟠 node.vm_textarea 輸入物件
// 🟠 node.vm_list MVVM 列表 (extends node.div)
// 🟠 node.vm_single MVVM 單一物件 (extends node.div)
// 🟡 node.proxy 資料轉為 MVVM 模式
// ✅ p_index.js 為網站首頁
// ✅ 透過 tid (tag id) 可以在不同層級的元件溝通呼叫更簡易，可在 debug 面板查閱標籤的 tid 屬性
// ✅ tid 設計上應單獨唯一的存在, 使用方式 node.div('app')，'app' 就是 tid
// ✅ xx.getChildById('app') 就是抓取物件樹中有 tid 為 app 的物件
// ✅ css class .active - 可設置 router button 的選中中的狀態樣式
// ✅ node.mv 採 mvvm 的物件設計，同步 model 與 view，請參考 src/page/p_introA.js

// store init
store.init()

// router init
router.init()

// app entry - root node
node.div('app')