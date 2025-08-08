import { node } from "../../src/core/node.js"

export let quilljs = {
    init() {
        let link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = './plugins/quill/quill.snow.css'
        document.head.append(link)

        let script = document.createElement('script')
        script.onload = () => {
            script.onload = null
            script.remove()
        }
        document.body.append(script)
        script.src = "./plugins/quill/quilljs.js"
    },
    create(id) {
        let jsdom = node.div(id)
        jsdom.getH5Tag().id = id
        jsdom.getH5Tag().innerHTML = '<h1>Hello</h1>'
        let update = () => {
            jsdom.quill = new window.Quill('#' + id, { theme: 'snow' });
        }
        requestAnimationFrame(update)
        return jsdom
    }
}