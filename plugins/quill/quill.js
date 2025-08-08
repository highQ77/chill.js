import { node } from "../../src/core/node.js"

export let quilljs = {
    init() {
        let link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css'
        document.head.append(link)

        let script = document.createElement('script')
        script.onload = () => {
            script.onload = null
            script.remove()
        }
        document.body.append(script)
        script.src = "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"
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