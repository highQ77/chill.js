import { node } from "../core/node.js"
import { router } from "../core/router.js"
import { store } from "../core/store.js"

export const p_intro = () => {

    // custom css class
    const btnClass = 'inline-flex p-2 cursor-pointer hover:bg-[#333]'
    const navSubBGColor = node.proxy(store.data.p_introB.navSubBGColor)

    // UI DOM Build
    let jsdom = node.div('hi').setChildren([
        node.div('subNav').setClass(`p-1 bg-[${navSubBGColor[0]}] flex justify-center`).setChildren(
            router.group('routerViewIntro', [
                node.button('', 'MVVM', btnClass, 'index/intro/pageA').setStyle({ marginRight: '1px' }),
                node.button('', 'Misc.', btnClass, 'index/intro/pageB')
            ])
        ),
        node.div('routerViewIntro')
    ])

    // UI Interaction
    let sn = jsdom.getChildById('subNav')
    sn.setStyle({ background: navSubBGColor[0] })

    // cross component communication with pub / sub module
    let token = node.pubsub.subscribe('changeSubNavBG', data => {
        navSubBGColor[0] = data
        sn.setStyle({ background: data })
    })

    // when leave router view
    router.onSwitchRouterView(jsdom, () => {
        node.pubsub.unsubscribe(token)
    })

    return jsdom
}
