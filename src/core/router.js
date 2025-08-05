import { config } from "../config.js"
import { node } from "./node.js"

let setting
window.addEventListener('popstate', popstate)

export let router = {
    init() {
        requestAnimationFrame(popstate)
    },
    // go to new page
    go(pageId) {
        if (!pageId) return
        if (location.href.split('/#/')[1] == pageId) return // check repeat mouse click
        pageId = setting[pageId].default || pageId // if u have default page
        let url = location.protocol + '//' + location.host + '/#/' + pageId
        history.pushState({}, '', url);
        window.dispatchEvent(new Event('popstate'));
    },
    // set btn active class and apply routerView id
    group(viewId, btns) {
        btns[0].setClass(btns[0].getClass() + ' active')
        btns.forEach(btn => {
            setting[btn.routerPageId].viewId = viewId // auto add viewId
        })
        return btns
    },
}

function popstate() {
    setting = setting || config.router
    let pageId = location.href.split('/#/')[1]
    if (!pageId) {
        pageId = Object.keys(setting)[0]
    }
    changeContent(pageId)
}

function changeContent(pageId) {
    let seg = pageId.split('/')
    let segResult = ''
    let len = seg.length
    let pageIds = []
    for (let i = 0; i < len; i++) {
        segResult += '/' + seg.shift()
        pageIds.push(segResult)
    }
    pageIds = pageIds.map(pid => pid.slice(1))
    for (let i = 0; i < pageIds.length; i++) {
        pageId = pageIds[i]
        let t = setting[pageId].dom_tpl()
        if (i == 0) {
            if (!node.app().getChildren()[0])
                node.app().setChildren([t])
            let defId = setting[pageId].default
            if (defId) {
                let t2 = setting[defId].dom_tpl()
                let vid2 = setting[defId].viewId
                node.app().getChildById(vid2).setChildren([t2])
            }
        } else {
            let vid = setting[pageId].viewId
            node.app().getChildById(vid).setChildren([t])
        }

    }
}