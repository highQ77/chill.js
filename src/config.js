import { p_home } from "./page/p_home.js";
import { p_index } from "./page/p_index.js";
import { p_intro } from "./page/p_intro.js";
import { p_introA } from "./page/p_introA.js";
import { p_introB } from "./page/p_introB.js";

export const config = {
    router: {
        // 'pageId': { page: your jsdom template, default: 'default sub router path' }
        'index': { dom_tpl: p_index, default: 'index/home' },
        'index/home': { dom_tpl: p_home },
        'index/intro': { dom_tpl: p_intro, default: 'index/intro/pageA' },
        'index/intro/pageA': { dom_tpl: p_introA },
        'index/intro/pageB': { dom_tpl: p_introB },
    },
    store: {
        // do not use node.proxy function in store object properties, it's only store primitive value
        // there are only two types of data, single value and array
        p_introA: {
            // use vm_list with array
            fruit: [{ fruit: 'apple', price: 10 }, { fruit: 'orange', price: 5 }, { fruit: 'banana', price: 7 }],
            // use vm_single with - single value (string or number)
            single: 'time: ' + Date.now(),

        },
        p_introB: {
            textAreaTest: 'enter somethings here'
        }
    }
}