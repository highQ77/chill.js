import { router } from "./router.js";

// --------------------------------------------------------DOM cache ----------------------------------------------------------------

// page change and get all node tid, speed up tid search
let nodes = []
{
    function deepSearch(node) {
        if (node.__id.indexOf('tag-') == -1) {
            nodes.push(node)
        }
        if (node.getChildren) {
            let chs = node.getChildren()
            for (let i = 0; i < chs.length; i++) {
                nodes = deepSearch(chs[i])
            }
        }
        return nodes
    }
    let updateNodes = () => {
        nodes.length = 0
        nodes = deepSearch(node.app())
        // console.log(nodes) 
        return nodes.length
    }
    window.addEventListener('popstate', updateNodes)
    let update = () => {
        let result = updateNodes()
        if (result == 1) requestAnimationFrame(update)
        else 'mounted' // 😎
    }
    requestAnimationFrame(update)
}
// --------------------------------------------------------DOM----------------------------------------------------------------

let idCounter = 0
class NodeBase {
    // root node 
    static __app = null
    /** generate unique id in constructor, you can set id by setId function */
    __id = ''
    /** store NodeContainer objects */
    __children = []
    /** store parent NodeContainer object */
    __parent = null
    /** store event handler */
    __eventList = []

    constructor() {
        this.__id = `tag-${++idCounter}`
    }

    /** release memory, clear timer, and remove event listener here  */
    remove() {
        if (this.removeChildren) this.removeChildren()
        this.__parent = null

        // remove event
        if (this.__eventList) {
            this.__eventList.forEach(e => {
                this.__tag.removeEventListener(e.eventName, e.event)
                delete e.event.exe
            })
            this.__eventList.length = 0
            delete this.__eventList
        }

        if (this.__tag) {
            this.__tag.remove()
            delete this.__tag
        }
    }

    /** get tid */
    getId() {
        return this.__id
    }

    /** get parent */
    getParent() {
        return this.__parent
    }

    /** set style */
    setStyle(styleObj) {
        if (this.__tag)
            Object.keys(styleObj).forEach(k => {
                this.__tag.style[k] = styleObj[k]
            })
        return this
    }

    /** get style */
    getStyle() {
        return this.__tag?.style
    }

    /** set class */
    setClass(classStr) {
        this.__tag.className = classStr
        return this
    }

    /** get css class */
    getClass() {
        return this.__tag.className
    }

    /** event - auto remove event by calling remove function */
    on(eventName, execFun, bubble) {
        if (!this.__tag) return this
        const event = e => { execFun(e, this) }
        event.exe = execFun
        this.__tag.addEventListener(eventName, event, bubble)
        this.__eventList.push({ eventName, event })
        return this
    }

    /** delete event */
    off(eventName, execFun) {
        let e = this.__eventList.filter(e => e.eventName == eventName && e.event.exe == execFun)[0]
        if (!e) return this
        let index = this.__eventList.findIndex(ev => ev == e)
        this.__tag.removeEventListener(e.eventName, e.event)
        this.__eventList.splice(index, 1)
        return this
    }

    has(eventName, execFun) {
        return !!this.__eventList?.filter(e => e.eventName == eventName && e.event.exe == execFun)[0]
    }
}

class Div extends NodeBase {

    /** html tag instance */
    __tag = document.createElement('div')

    constructor(tid) {
        super()
        tid && (this.__id = tid)
        tid && this.__tag.setAttribute('tid', this.__id)
        if (idCounter == 1) {
            NodeBase.__app = this
            document.body.append(this.__tag)
        }
    }

    /** get html tag object */
    getH5Tag() {
        return this.__tag
    }

    /** get children */
    getChildren() {
        return this.__children
    }

    /** set children, minimal update in JSDOM */
    setChildren(tags = []) {
        if (this.__children.length) {
            this.removeChildren()
        }
        tags.forEach(ch => {
            ch.__parent = this
            this.__tag.append(ch.__tag)
        })
        this.__children = [...tags]
        return this
    }

    /** remove children */
    removeChildren() {
        [...this.__children].forEach(ch => {
            ch.remove()
        })
        this.__children.length = 0
        return this
    }

    /** get child by tid */
    getChildById(tid) {
        if (tid == this.__id) { return this }
        let chs = this.__children
        for (let i = 0; i < chs.length; i++) {
            if (chs[i].__id == tid) return chs[i]
            if (chs[i].getChildById) {
                let c = chs[i].getChildById(tid)
                if (c) return c
            }
        }
        return null
    }

    /** push a child */
    pushChild(jsdom) { // 🟢
        jsdom.__parent = this
        this.__children.push(jsdom)
        this.getH5Tag().append(jsdom.getH5Tag())
    }

    /** pop a child */
    popChild() { // 🟢
        if (this.__children.length) {
            let ch = this.__children[this.__children.length - 1]
            ch.remove()
            return this.__children.pop()
        }
        return null
    }

    /** shift a child */
    shiftChild() { // 🟢
        let ch = this.__children[0]
        ch?.remove()
        this.__children.shift()
    }

    /** unshift a child */
    unshiftChild(jsdom) { // 🟢
        this.__children.unshift(jsdom)
        this.getH5Tag().prepend(jsdom.getH5Tag())
    }

    /** add child at target index */
    addChildAt(jsdom, index) { // 🟢
        if (index < 0) index = 0
        if (index > this.__children.length - 1)
            index = this.__children.length
        let tag = this.__children[index + 1]?.getH5Tag()
        let tag2 = jsdom.getH5Tag()
        if (tag) this.getH5Tag().insertBefore(tag2, tag)
    }

    /** remove child at target index */
    removeChildAt(index) { // 🟢
        if (index < 0) index = 0
        if (index > this.__children.length - 1)
            index = this.__children.length - 1
        if (index > -1) {
            let del = this.__children.splice(index, 1)[0]
            del?.remove()
        }
    }

    /** replace child */
    replaceChildAt(jsdom, index) {
        if (index < 0) index = 0
        if (index > this.__children.length - 1)
            index = this.__children.length - 1
        let del = this.__children.splice(index, 1)[0]
        del?.remove()
        this.__children.splice(index, 0, jsdom)
        let tag = this.__children[index]?.getH5Tag()
        let tag2 = this.__children[index + 1]?.getH5Tag()
        if (tag) this.getH5Tag().insertBefore(tag, tag2)
    }

    /** set innerText, and setChildren can't work */
    setText(str) {
        this.setChildren = null
        this.__tag.innerText = str
        return this
    }

    /** get text */
    getText() {
        return this.__tag.innerText
    }

}

class HRule extends NodeBase {

    /** html tag instance */
    __tag = document.createElement('hr')

    constructor(tid) {
        super()
        tid && (this.__id = tid)
        tid && this.__tag.setAttribute('tid', this.__id)
        this.setStyle({ border: 'none', borderBottom: '1px solid #FFFFFF33', margin: '10px 0px' })
    }

    /** get html tag object */
    getH5Tag() {
        return this.__tag
    }

}

class Span extends NodeBase {

    /** html tag instance */
    __tag = document.createElement('span')

    constructor(tid) {
        super()
        tid && (this.__id = tid)
        tid && this.__tag.setAttribute('tid', this.__id)
    }

    /** get html tag object */
    getH5Tag() {
        return this.__tag
    }

    /** set innerText, and setChildren can't work */
    setText(str) {
        this.__tag.innerText = str
        return this
    }

    /** get text */
    getText() {
        return this.__tag.innerText
    }
}

class Head extends NodeBase {
    /** html tag instance */

    constructor(tid, level = 1) {
        super()
        if (level < 0) level = 0
        if (level > 6) level = 6
        this.__tag = document.createElement('h' + level)
        tid && (this.__id = tid)
        tid && this.__tag.setAttribute('tid', this.__id)
    }

    /** get html tag object */
    getH5Tag() {
        return this.__tag
    }

    /** set innerText, and setChildren can't work */
    setText(str) {
        this.__tag.innerText = str
        return this
    }

    /** get text */
    getText() {
        return this.__tag.innerText
    }
}

class Img extends NodeBase {

    /** html tag instance */
    __tag = document.createElement('img')

    constructor(tid) {
        super()
        tid && (this.__id = tid)
        tid && this.__tag.setAttribute('tid', this.__id)
    }

    /** get html tag object */
    getH5Tag() {
        return this.__tag
    }

    setSrc(src) {
        this.__tag.onload = () => {
            this.__tag.onload = null
            this.__tag.width = this.__tag.naturalWidth
            this.__tag.height = this.__tag.naturalHeight
        }
        this.__tag.src = node.getAssetsPath(src)
        return this
    }

}

class Input extends NodeBase {

    __item

    /** html tag instance */
    __tag = document.createElement('input')

    constructor(tid, item, type) { // item is single proxy item 
        super()
        tid && (this.__id = tid)
        tid && this.__tag.setAttribute('tid', this.__id)
        this.__item = item
        this.setType(type)
        this.__observe(item)
    }

    __observe(item) {
        item.vms = item.vms || []
        item.vms.push(this)
        item.update = () => item.vms.forEach(vm => vm.__update(item))

        this.value = item[0]
        item.type = 'input'
        this.on('input', e => {
            if (this.value != e.target.value) {
                this.value = e.target.value
                item.update()
            }
        })
    }

    remove() {
        if (this.__item.vms.length == 1) {
            this.__item.vms.length = 0 //
            this.__item.vms = null
        }
        this.__item.update = null
        this.__item.length = 0
        delete this.__item
        super.remove()
    }

    /** get html tag object */
    getH5Tag() {
        return this.__tag
    }

    setType(type) {
        this.__tag.type = type;
        return this
    }

    setName(name) {
        this.__tag.name = name;
        return this
    }

    setPlaceholder(val) {
        this.__tag.placeholder = val;
        return this
    }

    set value(val) {
        this.__item[0] = val
        this.__tag.value = val;
        return this
    }

    get value() {
        return this.__item[0]
    }

    __update() {
        this.__tag.value = this.value;
    }
}

class TextArea extends NodeBase {

    __item

    /** html tag instance */
    __tag = document.createElement('textarea')

    constructor(tid, item) { // item is single proxy item
        super()
        tid && (this.__id = tid)
        tid && this.__tag.setAttribute('tid', this.__id)
        this.__item = item
        this.__observe(item)
    }

    __observe(item) {
        item.vms = item.vms || []
        item.vms.push(this)
        item.update = () => item.vms.forEach(vm => vm.__update(item))

        this.value = item[0]
        item.type = 'input'
        this.on('input', e => {
            if (this.value != e.target.value) {
                this.value = e.target.value
                item.update()
            }
        })
    }

    remove() {
        if (this.__item.vms.length == 1) {
            this.__item.vms.length = 0 //
            this.__item.vms = null
        }
        this.__item.update = null
        this.__item.length = 0
        delete this.__item
        super.remove()
    }

    /** get html tag object */
    getH5Tag() {
        return this.__tag
    }

    setName(name) {
        this.__tag.name = name;
        return this
    }

    setPlaceholder(val) {
        this.__tag.placeholder = val;
        return this
    }

    set value(val) {
        this.__item[0] = val
        this.__tag.value = val;
        return this
    }

    get value() {
        return this.__item[0]
    }

    __update() {
        this.__tag.value = this.value;
    }

}

class Canvas extends NodeBase {

    /** html tag instance */
    __tag = document.createElement('canvas')
    __ctx

    constructor(tid) {
        super()
        tid && (this.__id = tid)
        tid && this.__tag.setAttribute('tid', this.__id)
        this.setSize(250, 250)
        this.__ctx = this.__tag.getContext('2d')
    }

    remove() {
        this.__ctx = null
        super.remove()
    }

    /** get html tag object */
    getH5Tag() {
        return this.__tag
    }

    getContext() {
        return this.__ctx
    }

    setSize(w, h) {
        let c = this.getH5Tag()
        c.width = w
        c.height = h
        return this
    }

    setupDrawCode(func) {
        func(this.__ctx)
        return this
    }
}

class FilePicker extends NodeBase {

    static MODE_BASE64 = 0
    static MODE_ARRAYBUFFER = 1
    static MODE_TEXT = 2

    /** html tag instance */
    __tag = document.createElement('button')
    __hiddenFile = document.createElement('input')

    constructor(tid, label, className, readerMode = 2, callback) {
        super()
        tid && (this.__id = tid)
        tid && this.__tag.setAttribute('tid', this.__id)
        this.__hiddenFile.type = 'file'
        this.on('click', e => {
            this.__hiddenFile.click()
            this.__hiddenFile.onchange = e => {
                const file = e.target.files[0]
                const reader = new FileReader
                reader.onload = e => {
                    reader.onload = null
                    callback(e.target.result)
                }
                switch (readerMode) {
                    case FilePicker.MODE_TEXT:
                        reader.readAsText(file)
                        break;
                    case FilePicker.MODE_BASE64:
                        reader.readAsDataURL(file)
                        break;
                    case FilePicker.MODE_ARRAYBUFFER:
                        reader.readAsArrayBuffer(file)
                        break;
                }
            }
        })
        this.setText(label).setClass(className)
    }

    remove() {
        super.remove()
        this.__hiddenFile.onchange = null
        this.__hiddenFile.remove()
        this.__hiddenFile = null
    }

    /** get html tag object */
    getH5Tag() {
        return this.__tag
    }

    setText(str) {
        this.__tag.innerText = str
        return this
    }

}

class DatePicker extends Div {

    __currentDate = ''
    __selectDate = ''
    __dateArray = [] // string[]
    __dateClass // obj

    constructor(dateClass) {
        super()
        // tid && (this.__id = tid)
        // tid && this.__tag.setAttribute('tid', this.__id)
        this.__dateClass = dateClass
        this.__setup()
    }

    remove() {
        super.remove()
        // __dateClass = null
        // __dateArray.length = 0
        // __dateArray = null
    }

    __setup() {
        let now = new Date(),
            date = now.getDate(),
            month = now.getMonth() + 1,
            year = now.getFullYear(),
            arr = this.__fillArray(year, month)

        this.__updateCalendar(year, month, date, arr)
        this.__currentDate = this.__selectDate
    }

    getCurrentDate() {
        let [y, m, d] = this.__selectDate.split('-')
        m = m.padStart(2, '0')
        d = d.padStart(2, '0')
        let dd = y + '/' + m + '/' + d
        return this.__getFormatDate(new Date(dd))
    }

    __getFormatDate(date) {
        let dn = date || new Date(Date.now())
        let y = dn.getFullYear()
        let m = (dn.getMonth() + 1).toString().padStart(2, '0')
        let d = (dn.getDate()).toString().padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    __updateDateDatas() {
        let { dateDigiBottonNone, dateDigiBotton } = this.__dateClass
        let datas = []
        this.__dateArray.forEach(i => {
            datas.push(
                node.div().setStyle({
                    display: 'inline-flex',
                    justifyContent: 'center',
                    width: 'calc(100% / 7)',
                    cursor: 'pointer',
                }).setChildren([
                    node.div().setClass(i == '_' ? dateDigiBottonNone : dateDigiBotton).setStyle({
                        display: 'inline-flex',
                        justifyContent: 'center',
                        textAlign: 'center',
                        color: `${i == '_' ? 'rgba(50, 50, 50, 0.2)' : (this.__selectDate == i ? 'white' : 'black')}`,
                        // border: `1px solid ${i == '_' ? 'rgba(255,255,255,.5)' : 'cyan'}`,
                        width: '32px',
                        margin: '3px',
                        borderRadius: '4px',
                        outline: this.__checkCurrrentDate(i) ? '2px solid black' : '0px',
                        background: (this.__selectDate == i ? '#333' : '')
                    }).on('click', t => {
                        if (i == '_') return
                        this.__selectDate = i
                        this.__chooseSelectDate()
                    }).setText(i.split('-').pop())
                ])
            )
        });
        return datas
    }

    __fillArray(year, month) {
        const firstDay = new Date(year, month - 1, 1).getDay()
        const lastDay = new Date(year, month, 0).getDate()
        let arr = new Array(42).fill(0)
        let i = 0, j = firstDay
        for (i = 0; i < j; i++) {
            arr[i] = '_'
        }
        for (i = 0; i < lastDay; i++, j++) {
            arr[j] = year + '-' + month + '-' + (i + 1);
        }
        arr = arr.map(i => i == 0 ? '_' : i)
        return arr;
    }

    __nextMonth() {
        let [year, month, date] = this.__cpSelectDate()
        month = month + 1;
        if (month > 12) {
            year += 1;
            month = 1;
        }
        const arr = this.__fillArray(year, month);
        this.__updateCalendar(year, month, date, arr);
    }

    __prevMonth() {
        let [year, month, date] = this.__cpSelectDate()
        month = month - 1;
        if (month < 1) {
            year -= 1;
            month = 12;
        }
        const arr = this.__fillArray(year, month);
        this.__updateCalendar(year, month, date, arr);
    }

    __nextYear() {
        let [year, month, date] = this.__cpSelectDate()
        year = year + 1;
        const arr = this.__fillArray(year, month);
        this.__updateCalendar(year, month, date, arr);
    }

    __prevYear() {
        let [year, month, date] = this.__cpSelectDate()
        year = year - 1;
        const arr = this.__fillArray(year, month);
        this.__updateCalendar(year, month, date, arr);
    }

    __chooseCurrentDate() {
        const [year, month, date] = this.__currentDate.split('-')
        const arr = this.__fillArray(year, month);
        this.__updateCalendar(year, month, date, arr);
    }

    __chooseSelectDate() {
        const [year, month, date] = this.__selectDate.split('-')
        const arr = this.__fillArray(year, month);
        this.__updateCalendar(year, month, date, arr);
    }

    __checkCurrrentDate(date) {
        const [year1, month1, date1] = this.__currentDate.split('-')
        const [year2, month2, date2] = this.__selectDate.split('-')
        return year1 == year2 && month1 == month2 && date.split('-')[2] == date1
    }

    __cpSelectDate() {
        return this.__selectDate.split('-').map(n => parseInt(n))
    }

    __updateCalendar(year, month, date, arr) {
        if (this.__selectDate) {
            const [year1, month1, date1] = this.__currentDate.split('-')
            const [year2, month2, date2] = this.__selectDate.split('-')
            if (year != year2 || month != month2) {
                if (year1 == year && month1 == month) {
                    this.__selectDate = [year, month, date1].join('-')
                } else this.__selectDate = [year, month, 1].join('-')
            }
            else this.__selectDate = arr.filter(d => d && d.split('-')[2] == date)[0];
        } else {
            this.__selectDate = arr.filter(d => d && d.split('-')[2] == date)[0];
        }
        this.__dateArray = arr
        requestAnimationFrame(() => {
            this.getChildById('dateLabel').setText(this.__selectDate);
            this.getChildById('dateData').setChildren(this.__updateDateDatas())
        })
    }
}

class ColorPicker extends Div {

    __isMouseDown = false
    __singleColor //canvas
    __allColor //canvas
    __currentColor // no-color
    __colorLabel // label
    __hexColorLabel // label
    __input // input
    x = 255 - 1
    y = 0
    event = null

    constructor(colorClass) {
        super()
        // tid && (this.__id = tid)
        // tid && this.__tag.setAttribute('tid', this.__id)
        this.__colorClass = colorClass
    }

    remove() {
        this.__singleColor = null
        this.__allColor = null
        this.__currentColor = null
        this.__colorLabel = null
        this.__hexColorLabel = null
        this.__input = null
        this.__dialog = null
        super.remove()
    }

    __createSingleColorSpectrum(color = 'red') {
        let ctx = this.__singleColor.getContext()
        let canvas = ctx.canvas

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!color) color = '#f00'
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        whiteGradient.addColorStop(0, "#fff");
        whiteGradient.addColorStop(1, "transparent");
        ctx.fillStyle = whiteGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        blackGradient.addColorStop(0, "transparent");
        blackGradient.addColorStop(1, "#000");
        ctx.fillStyle = blackGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.__singleColor.on('mousedown', e => { this.__isMouseDown = true, this.__spectrumClick(e) })
        this.__singleColor.on('mousemove', e => { this.__isMouseDown && this.__spectrumClick(e) })
        this.__singleColor.on('mouseup', e => { this.__isMouseDown = false, this.__spectrumClick(e) })
        this.__singleColor.on('mouseleave', _ => { this.__isMouseDown = false })
    }

    __createMultiColorSpectrum() {
        let ctx = this.__allColor.getContext()
        let canvas = ctx.canvas

        let hueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        hueGradient.addColorStop(0.00, "#ff0000");
        hueGradient.addColorStop(0.17, "#ff00ff");
        hueGradient.addColorStop(0.33, "#0000ff");
        hueGradient.addColorStop(0.50, "#00ffff");
        hueGradient.addColorStop(0.67, "#00ff00");
        hueGradient.addColorStop(0.83, "#ffff00");
        hueGradient.addColorStop(1.00, "#ff0000");

        ctx.fillStyle = hueGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.__allColor.on('mousedown', e => { this.__isMouseDown = true, this.__hueClick(e) })
        this.__allColor.on('mousemove', e => { this.__isMouseDown && this.__hueClick(e) })
        this.__allColor.on('mouseup', e => { this.__isMouseDown = false, this.__hueClick(e) })
        this.__allColor.on('mouseleave', _ => { this.__isMouseDown = false })
    }

    __hueClick(e) {
        let y = e ? (e.pageY - this.__getTop(e.currentTarget) - window.scrollY) : this.y;
        const allColorContext = this.__allColor.getContext()
        let imgData = allColorContext.getImageData(0, y, 1, 1).data;
        this.__createSingleColorSpectrum('rgb(' + imgData[0] + ', ' + imgData[1] + ', ' + imgData[2] + ')');
        this.__spectrumClick(null)
    }

    __spectrumClick(e) {
        let x = e ? (e.pageX - this.__getLeft(e.currentTarget)) : this.x;
        let y = e ? (e.pageY - this.__getTop(e.currentTarget) - window.scrollY) : this.y;
        const singleColorContext = this.__singleColor.getContext()
        let imgData = singleColorContext.getImageData(x, y, 1, 1).data;
        this.__currentColor.setStyle({ background: `rgb(${imgData[0]}, ${imgData[1]}, ${imgData[2]})` })
        this.__colorLabel.setText(`rgb(${imgData[0]}, ${imgData[1]}, ${imgData[2]})`)
        this.__hexColorLabel.setText(this.__rgbToHex(imgData[0], imgData[1], imgData[2]))
        this.x = x
        this.y = y
        this.event = e
    }

    __getLeft(obj) {
        let offset = obj.offsetLeft;
        if (obj.offsetParent != null) offset += this.__getLeft(obj.offsetParent);
        return offset;
    }

    __getTop(obj) {
        let offset = obj.offsetTop;
        if (obj.offsetParent != null) offset += this.__getTop(obj.offsetParent);
        return offset;
    }

    __componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    __rgbToHex = (r, g, b) => {
        return "#" + this.__componentToHex(r) + this.__componentToHex(g) + this.__componentToHex(b);
    }

    reset() {
        this.x = 255 - 1
        this.y = 0
        this.__hueClick(null)
    }
}

// ViewModel List
class VMList extends Div {

    __item_tpl
    __items

    constructor(tid, item_tpl, items) {
        super(tid)
        this.__item_tpl = item_tpl
        this.__items = items
        this.__observe(items)
    }

    __observe(items) {

        // first item
        if (!items.inited) {
            items.inited = items
            items.vms = [this]
            items.update = () => items.vms.forEach(vm => vm.__update(items.inited))
            items.first = this
            items.state = []
            items.isZero;
        } else {
            // second item and later added item
            items.vms.push(this)
            items.update = () => items.vms.forEach(vm => vm.__update(items.inited))
            items.update()
            items.state = []
            items.isZero;
            return
        }

        // push
        let pushRef = items.push.bind(this)
        items.push = (item) => {
            items.state = ['push']
            this.pushChild(item)
            items[items.length] = item
            items.update()
            items.isZero = false
            return pushRef(item)
        }

        // initialize
        items.forEach((item, idx) => {
            this.pushChild(item, idx)
        })

        // pop
        let popRef = items.pop.bind(this)
        items.pop = () => {
            items.state = ['pop']
            if (items.length) {
                this.popChild()
                items.length = items.length - 1
                items.update()
                if (items.length == 0) items.isZero = true
                return popRef()
            } else return null
        }

        // shift
        let shiftRef = items.shift.bind(this)
        items.shift = () => {
            items.state = ['shift']
            if (items.length) {
                this.shiftChild();
                let d = [...items]
                d.shift()
                for (let i = 0; i < items.length; i++) {
                    d[i] && (items[i] = d[i])
                }
                items.length = items.length - 1
                items.update()
                if (items.length == 0) items.isZero = true
                return shiftRef()
            } else return null
        }

        // unshift
        let unshiftRef = items.unshift.bind(this)
        items.unshift = (item) => {
            items.state = ['unshift']
            this.unshiftChild(item)
            for (let i = items.length; i > 0; i--) {
                items[i] = items[i - 1]
            }
            items[0] = item
            items.update()
            items.isZero = false
            return unshiftRef(item)
        }

        // splice
        let spliceRef = items.splice.bind(this)
        items.splice = (index, delCount, item) => {
            if (delCount) {
                if (item) {
                    items.state = ['update', index]
                    // update element
                    this.replaceChildAt(item, index)
                    items.update()
                } else {
                    items.state = ['removeAt', index]
                    // splice remove at
                    if (index > items.length - 1) return null
                    let d = [...items]
                    delete d[index]
                    d = d.filter(i => i)
                    for (let i = 0; i < d.length; i++) {
                        items[i] = d[i]
                    }
                    items.length = items.length - 1

                    this.popChild()
                    items.update()
                }
                return spliceRef(index, 0)
            } else {
                // splice add at
                items.state = ['addAt', index]
                if (items.length > 0) {
                    if (items.length == 1) {
                        this.pushChild(item)
                    } else
                        this.pushChild(items[items.length - 1])
                    let d = [...items]
                    d.splice(index, 0, item)
                    for (let i = 0; i < d.length; i++) {
                        items[i] = d[i]
                    }
                    items.update()
                    return spliceRef(index, 0, item)
                }
                return []
            }
        }

        // reverse
        let reverseRef = items.reverse.bind(this)
        items.reverse = () => {
            items.state = ['update']
            if (items.length == 0) return reverseRef()
            let result = [...items].reverse()
            let len = result.length
            for (let i = 0; i < len; i++) {
                items[i] = result[i]
            }
            items.update()
            return reverseRef()
        }

        // sort
        let sortRef = items.sort.bind(this)
        items.sort = (compare) => {
            items.state = ['update']
            if (items.length == 0) return sortRef(compare)
            let result = [...items].sort(compare)
            let len = result.length
            for (let i = 0; i < len; i++) {
                items[i] = result[i]
            }
            items.update()
            return sortRef(compare)
        }

    }

    remove() {
        super.remove()

        this.__items.inited = null
        if (this.__items.vms) this.__items.vms.length = 0
        this.__items.vms = null
        this.__items.update = null
        this.__items.first = null
        this.__items.state = null

        this.__items.length = 0
        delete this.__items
        this.__item_tpl = null
    }

    /** push a child */
    pushChild(item, updateIndex) {
        if (!this?.__item_tpl) return
        let jsdom = this.__item_tpl(item, updateIndex)
        super.pushChild(jsdom)
    }

    /** pop a child */

    /** shift a child */

    /** unshift a child */
    unshiftChild(item) {
        let jsdom = this.__item_tpl(item)
        super.unshiftChild(jsdom)
    }

    /** add child at target index */
    addChildAt(item, index) {
        let jsdom = this.__item_tpl(item)
        super.addChildAt(jsdom, index)
    }

    /** remove child at target index */

    /** replace child */
    replaceChildAt(item, index) {
        let jsdom = this.__item_tpl(item)
        super.replaceChildAt(jsdom, index)
    }

    /** vm update */
    __update(items_inited) {
        let clone = (items_inited ? [...items_inited] : []).filter(i => i)
        let cloneLen = clone.length
        this.removeChildren()
        for (let i = 0; i < cloneLen; i++)
            this.pushChild(clone[i], i)
    }
}

// ViewModel Single
class VMSingle extends Div {

    __item_tpl
    __items

    constructor(tid, item_tpl, items) {
        super(tid)
        this.__item_tpl = item_tpl
        this.__items = items
        items.length = 1 // confirm only 1 value
        this.__observe(items)
    }

    __observe(items) {

        items.vms = items.vms || []
        items.vms.push(this)
        items.update = () => items.vms.forEach(vm => vm.__update(items))

        items.first = this
        items.state = []
        items.isZero;

        // push
        let pushRef = items.push.bind(this)
        items.push = (item) => {
            items.state = ['push']
            this.pushChild(item)
            items[items.length] = item
            items.update()
            items.isZero = false
            return pushRef(item)
        }

        // initialize
        items.forEach((item, idx) => {
            this.pushChild(item, idx)
        })

        // pop
        let popRef = items.pop.bind(this)
        items.pop = () => {
            items.state = ['pop']
            if (items.length) {
                this.popChild()
                items.length = items.length - 1
                items.update()
                if (items.length == 0) items.isZero = true
                return popRef()
            } else return null
        }

    }

    remove() {
        super.remove()
        if (this.__items.vms.length == 1) {
            this.__items.vms.length = 0 //
            this.__items.vms = null
        }

        this.__items.update = null
        this.__items.first = null
        this.__items.state = null

        this.__items.length = 0
        delete this.__items
        this.__item_tpl = null
    }

    /** push a child */
    pushChild(item, updateIndex) {
        let jsdom = this.__item_tpl(item, updateIndex)
        super.pushChild(jsdom)
    }

    /** vm update */
    __update(items_inited) {
        let clone = (items_inited ? [...items_inited] : []).filter(i => i)
        let cloneLen = clone.length
        this.removeChildren()
        for (let i = 0; i < cloneLen; i++)
            this.pushChild(clone[i], i)
    }

}

// --------------------------------------------------------UI Base----------------------------------------------------------------

const getUniqueId = () => (Date.now() + '').slice(7) + (Math.random().toFixed(3) + '').split('.')[1] // 防止 id 衝突

// selection - dropdown menu
const vm_select = (id, title, vmItemTemplate, vmDatas, cssWidth, maxHeight, cssThemeColor, cssThumbColor, cssTrackColor, cssSelecedColor, clickCallback) => {
    if (!id) id = getUniqueId()

    // calculate item height
    let app = node.app()
    app.pushChild(vmItemTemplate('1'))
    let cs = app.getChildren()
    let itemHeight = cs[cs.length - 1].getH5Tag().getBoundingClientRect().height
    let itemsHeight = vmDatas.length * itemHeight
    if (itemsHeight > maxHeight) itemsHeight = maxHeight
    app.popChild()

    // jsdom
    const jsdom = node.div(id + 'selection').setStyle({ position: 'relative', width: cssWidth, cursor: 'pointer' }).setChildren([
        node.div(id + 'title').setText(title).setStyle({ background: cssThemeColor, boxShadow: '0px 0px 5px black', borderRadius: '8px', padding: '5px 10px' }),
        node.scroller(id + 'menuScroller', cssWidth, itemsHeight + 'px', cssThumbColor, cssTrackColor, '0px', '0px',
            node.vm_list(id + 'menu', vmItemTemplate, vmDatas).setStyle({ display: 'none', boxShadow: '0px 0px 5px black', width: cssWidth, background: 'rgba(100,100,100, 0.6)', backdropFilter: 'blur(10px)' })
            , 0, true, (scrollComs) => {
                let { content, wrapper } = scrollComs
                let itemsHeight = vmDatas.length * itemHeight
                if (itemsHeight > maxHeight) itemsHeight = maxHeight
                content.setStyle({ height: itemsHeight + 'px' })
                wrapper.setStyle({ height: itemsHeight + 'px' })
                selectScroller.setStyle({ height: itemsHeight + 'px' })
            }).setStyle({ position: 'absolute', zIndex: '999', overflow: 'hidden' })
    ]).on('mouseenter', () => {
        selectScroller.setStyle({ display: 'block' })
        let titleRect = selectTitle.getH5Tag().getBoundingClientRect()
        let scroRect = selectScroller.getH5Tag().getBoundingClientRect()
        selectMenu.setStyle({ display: 'block' })
        if (scroRect.top + scroRect.height > window.innerHeight) {
            selectScroller.setStyle({ top: -scroRect.height + 'px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px' })
            selectTitle.setStyle({ borderTopLeftRadius: '0px', borderTopRightRadius: '0px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' })
        } else {
            selectScroller.setStyle({ top: titleRect.height + 'px', borderTopLeftRadius: '0px', borderTopRightRadius: '0px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' })
            selectTitle.setStyle({ borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px' })
        }
    }).on('mouseleave', () => {
        let titleRect = selectTitle.getH5Tag().getBoundingClientRect()
        selectTitle.setStyle({ borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' })
        selectScroller.setStyle({ top: titleRect.height + 'px', display: 'none' })
    })

    let selectScroller = jsdom.getChildById(id + 'menuScroller')
    let selectMenu = jsdom.getChildById(id + 'menu')
    let selectTitle = jsdom.getChildById(id + 'title')

    // when push item, item will bind a click function
    let originalData = [...vmDatas]
    vmDatas.length = 0
    let push = vmDatas.push
    vmDatas.push = function (item) {
        let index = push(item)
        requestAnimationFrame(() => {
            let allNode = selectMenu.getChildren()
            let clickElement = allNode[index - 1]
            clickElement.setStyle({ borderLeft: '1px solid transparent' })
            clickElement.on('click', (e, t) => {
                allNode.forEach(node => {
                    node.setStyle({ borderLeft: '1px solid transparent' })
                })
                t.setStyle({ borderLeft: '1px solid ' + cssSelecedColor })
                clickCallback && clickCallback(t.getText())
                selectTitle.setText(title + ' - ' + t.getText())
            })
        })
    }
    while (originalData.length != 0) {
        let item = originalData.shift()
        vmDatas.push(item)
    }

    return jsdom
}

/**  scroller (policy: 0-vertical, 1-horizontal, 2-both), isIndexPage - scroller observer will not destroy */
const scroller = (id, cssWidth, cssHeight, cssThumbColor, cssTrackColor, cssTrackVOffsetX, cssTrackHOffsetY, contentNode, policy = 0, isIndexPage = true, resizeCallback) => {
    if (!id) id = getUniqueId()

    // fit scroll content
    let contentW = 0
    let contentNodeStyle = contentNode.getStyle()
    let w = parseInt(contentNodeStyle.width)
    if (!(!w || isNaN(w))) {
        if (contentNodeStyle.width.slice((w + '').length) == 'px') {
            contentW = contentNodeStyle.width
        }
    }

    // scroller jsdom
    const scro = node.div(id).setStyle({ position: 'relative', display: 'inline-flex' }).setChildren([
        node.div(id + '__contentWrapper').setStyle({ position: 'relative', overflow: 'auto', width: cssWidth, height: cssHeight }).setChildren([
            node.div(id + '__content').setStyle({ position: 'absolute', left: '0px', top: '0px', width: contentW || cssWidth, height: cssHeight }).setChildren([contentNode]),
        ]),
        node.div(id + '__barV').setStyle({ position: 'absolute', background: cssTrackColor, borderRadius: '10px', width: '7px', height: '100%', top: '0px', right: cssTrackVOffsetX, transition: 'opacity .2s', opacity: '0', overflow: 'hidden' }).setChildren([
            node.div(id + '__thumbV').setStyle({ position: 'absolute', background: cssThumbColor, borderRadius: '10px', width: '5px', height: '100%', top: '0px', right: '1px' })
        ]),
        node.div(id + '__barH').setStyle({ position: 'absolute', background: cssTrackColor, borderRadius: '10px', width: '100%', height: '7px', top: `calc(${cssHeight} + ${cssTrackHOffsetY})`, transition: 'opacity .2s', opacity: '0', overflow: 'hidden' }).setChildren([
            node.div(id + '__thumbH').setStyle({ position: 'absolute', background: cssThumbColor, borderRadius: '10px', width: '100%', height: '5px', bottom: '0px', top: '1px' })
        ])
    ])
    const barV = scro.getChildById(id + '__barV')
    const thumbV = scro.getChildById(id + '__thumbV')
    const barH = scro.getChildById(id + '__barH')
    const thumbH = scro.getChildById(id + '__thumbH')
    const content = scro.getChildById(id + '__content')
    const wrapper = scro.getChildById(id + '__contentWrapper')

    const scrollerComponents = {
        barV,
        thumbV,
        barH,
        thumbH,
        content,
        wrapper
    }

    // scroll vertical
    if (policy == 0 || policy == 2) {
        let timeId
        let timeId2
        let timeId3
        let preTop

        const scrollfunc = e => {
            let contentHeight = content.getH5Tag().getBoundingClientRect().height // visible height
            let contentNodeHeight = contentNode.getH5Tag().getBoundingClientRect().height // real height

            if (Math.abs(contentHeight - contentNodeHeight) < 2) { barV.setStyle({ transition: 'none', opacity: '0' }); return }

            let ratio = contentHeight / contentNodeHeight
            let top = wrapper.getH5Tag().scrollTop * ratio
            let emptyspace = contentHeight * (1 - ratio) - 1.5
            if (top < 1.5) top = 1.5
            else if (top > emptyspace) top = emptyspace
            thumbV.setStyle({ height: contentHeight * ratio + 'px', top: top + 'px' })

            // hide the scrollbar, when the mouse stop moving for 2 seconds
            if (timeId == null && top == preTop && barV.getH5Tag().style.opacity == '1') {
                timeId = setTimeout(() => {
                    barV.setStyle({ opacity: '0' })
                    timeId = null
                    let mm = () => {
                        scro.off('mousemove', mm)
                        barV.setStyle({ opacity: '1' })
                    }
                    scro.on('mousemove', mm, true)
                    let mm2 = () => {
                        clearTimeout(timeId2)
                        timeId2 = setTimeout(() => {
                            if (scro.has('mousemove', mm2)) {
                                scro.off('mousemove', mm2)
                                barV.setStyle({ opacity: '0' })
                            }
                            timeId2 = null
                        }, 1000)
                    }
                    scro.on('mousemove', mm2, true)
                }, 1500)
            }
            barV.setStyle({ transition: 'opacity .2s', opacity: '1' })
            preTop = top
        }

        // scroll events
        wrapper.on('scroll', scrollfunc)
        wrapper.on('mousemove', scrollfunc)
        scro.on('mouseenter', () => {
            let contentHeight = content.getH5Tag().getBoundingClientRect().height // visible height
            let contentNodeHeight = contentNode.getH5Tag().getBoundingClientRect().height // real height
            if (Math.abs(contentHeight - contentNodeHeight) >= 2) {
                barV.setStyle({ opacity: '1' })
                scrollfunc()
            }
        })
        scro.on('mouseleave', () => { barV.setStyle({ opacity: '0' }); })

        // observer content height
        let firstTime = true
        const observer = new ResizeObserver(() => {
            if (!content.getH5Tag()) return
            if (firstTime) { firstTime = false; return }
            let contentHeight = content.getH5Tag().getBoundingClientRect().height // visible height
            let contentNodeHeight = contentNode.getH5Tag().getBoundingClientRect().height // real height
            if (Math.abs(contentHeight - contentNodeHeight) > 2) {
                barV.setStyle({ opacity: '1' })
                clearTimeout(timeId3)
                timeId3 = setTimeout(() => {
                    barV.setStyle({ opacity: '0' })
                    timeId3 = null
                }, 1000)
            } else {
                barV.setStyle({ opacity: '0' })
            }
            scrollfunc()
            resizeCallback && resizeCallback(scrollerComponents)
        })
        observer.observe(contentNode.getH5Tag())

        // page leave watcher, and observer disconnect
        let storeHref = location.href
        let pageObserver = () => {
            if (location.href != storeHref && !isIndexPage) {
                isIndexPage && observer.disconnect()
                window.removeEventListener('popstate', pageObserver)
            }
        }
        window.addEventListener('popstate', pageObserver)
    }

    // scroll horizontal
    if (policy == 1 || policy == 2) {

        let timeId
        let timeId2
        let timeId3
        let preLeft

        const scrollfunc = e => {
            let contentWidth = parseInt(cssWidth) || content.getH5Tag().getBoundingClientRect().width // visible width
            let contentNodeWidth = contentNode.getH5Tag().getBoundingClientRect().width // real width

            if (Math.abs(contentWidth - contentNodeWidth) < 2) { barH.setStyle({ transition: 'none', opacity: '0' }); return }

            let ratio = contentWidth / contentNodeWidth
            let left = wrapper.getH5Tag().scrollLeft * ratio
            let emptyspace = contentWidth * (1 - ratio) - 1.5
            if (left < 1.5) left = 1.5
            else if (left > emptyspace) left = emptyspace
            thumbH.setStyle({ width: contentWidth * ratio + 'px', left: left + 'px' })

            // hide the scrollbar, when the mouse stop moving for 2 seconds
            if (timeId == null && left == preLeft && barH.getH5Tag().style.opacity == '1') {
                timeId = setTimeout(() => {
                    barH.setStyle({ opacity: '0' })
                    timeId = null
                    let mm = () => {
                        scro.off('mousemove', mm)
                        barH.setStyle({ opacity: '1' })
                    }
                    scro.on('mousemove', mm, true)
                    let mm2 = () => {
                        clearTimeout(timeId2)
                        timeId2 = setTimeout(() => {
                            if (scro.has('mousemove', mm2)) {
                                scro.off('mousemove', mm2)
                                barH.setStyle({ opacity: '0' })
                            }
                            timeId2 = null
                        }, 1000)
                    }
                    scro.on('mousemove', mm2, true)
                }, 1500)
            }
            barH.setStyle({ transition: 'opacity .2s', opacity: '1' })
            preLeft = left
        }

        // scroll events
        wrapper.on('scroll', scrollfunc)
        wrapper.on('mousemove', scrollfunc)
        scro.on('mouseenter', () => {
            let contentWidth = parseInt(cssWidth) || content.getH5Tag().getBoundingClientRect().width // visible width
            let contentNodeWidth = contentNode.getH5Tag().getBoundingClientRect().width // real width
            if (Math.abs(contentWidth - contentNodeWidth) >= 2) {
                barH.setStyle({ opacity: '1' })
                scrollfunc()
            }
        })
        scro.on('mouseleave', () => { barH.setStyle({ opacity: '0' }); })

        // observer content width
        let firstTime = true
        const observer = new ResizeObserver(() => {
            if (!content.getH5Tag()) return
            if (firstTime) { firstTime = false; return }
            let contentWidth = parseInt(cssWidth) || content.getH5Tag().getBoundingClientRect().width // visible width
            let contentNodeWidth = contentNode.getH5Tag().getBoundingClientRect().width // real width
            if (Math.abs(contentWidth - contentNodeWidth) > 2) {
                barH.setStyle({ opacity: '1' })
                clearTimeout(timeId3)
                timeId3 = setTimeout(() => {
                    barH.setStyle({ opacity: '0' })
                    timeId3 = null
                }, 1000)
            } else {
                barH.setStyle({ opacity: '0' })
            }
            scrollfunc()
            resizeCallback && resizeCallback(scrollerComponents)
        })
        observer.observe(contentNode.getH5Tag())

        // page leave watcher, and observer disconnect
        let storeHref = location.href
        let pageObserver = () => {
            if (location.href != storeHref && !isIndexPage) {
                observer.disconnect()
                window.removeEventListener('popstate', pageObserver)
            }
        }
        window.addEventListener('popstate', pageObserver)
    }

    return scro
}

// dialog
const dialog = (title, contentNode, buttons = [], essentialDialogStyle, width, height, callback) => {
    let { dialogTitleClass, dialogBodyClass, dialogBottonGroupClass, dialogButtonClass } = essentialDialogStyle
    let transparentCover = node.div().setStyle({
        display: 'flex',
        width: '100vw',
        height: '100dvh',
        position: 'fixed',
        left: '0px',
        top: '0px',
        background: '#00000066',
        justifyContent: 'center',
        alignItems: 'center'
    })
    const container = node.div().setClass(dialogBodyClass) // dialog backgroud
    const titleBar = node.div().setClass(dialogTitleClass).setText(title) // title
    const btnGroup = node.div().setClass(dialogBottonGroupClass)
    buttons.forEach(i => btnGroup.pushChild(i.setClass(dialogButtonClass))) // buttons
    container.pushChild(titleBar)
    container.pushChild(contentNode.setStyle({ width, height }))
    container.pushChild(btnGroup)
    transparentCover.pushChild(container)
    node.app().pushChild(transparentCover)

    // escape
    let quit = e => {
        if (e.key == 'Escape') {
            transparentCover.remove(); callback(false)
        }
    }
    document.addEventListener('keyup', quit)

    // observe dom status
    const observer = new MutationObserver((mutation) => {
        if (!document.body.contains(transparentCover.getH5Tag())) {
            observer.disconnect()
            document.body.style.overflow = 'auto' // enable scrolling
            document.removeEventListener('keyup', quit)
        }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    document.body.style.overflow = 'hidden' // stop scrolling

    return transparentCover
}

// alert dialog
const alert = (messeage, essentialDialogStyle, width, height, callback) => {
    let { dialogButtonClass } = essentialDialogStyle
    let content = node.div().setText(messeage).setClass('flex justify-center items-center')
    let buttons = []
    let btn = node.button('', 'OK', dialogButtonClass)
    btn.on('click', () => { dig.remove(); callback(true) })
    buttons.push(btn)
    let dig = dialog('Alert', content, buttons, essentialDialogStyle, width, height, callback)
    return dig
}

// confirm dialog
const confirm = (messeage, essentialDialogStyle, width, height, callback) => {
    let { dialogButtonClass } = essentialDialogStyle
    let content = node.div().setText(messeage).setClass('flex justify-center items-center')
    let buttons = []
    let btn = node.button('', 'OK', dialogButtonClass)
    let cancel = node.button('', 'Cancel', dialogButtonClass)
    btn.on('click', () => { dig.remove(); callback(true) })
    cancel.on('click', () => { dig.remove(); callback(false) })
    buttons.push(cancel)
    buttons.push(btn)
    let dig = dialog('Confirm', content, buttons, essentialDialogStyle, width, height, callback)
    return dig
}

// date dialog
const date = (essentialDialogStyle, dateClass, width, height, callback) => {
    let { dialogButtonClass } = essentialDialogStyle
    let gridStyle = {
        width: 'calc(100% / 7)',
        cursor: 'pointer',
        textAlign: 'center'
    }
    let content = (new DatePicker(dateClass)).setChildren([
        node.div().setClass('flex justify-between items-center').setChildren([
            node.button('leftx2', '<<', dialogButtonClass).setStyle({ height: '30px' }),
            node.button('left', '<', dialogButtonClass).setStyle({ height: '30px' }),
            node.span('dateLabel').setText('2025-08-01').setStyle({ width: '160px', textAlign: 'center' }),
            node.button('right', '>', dialogButtonClass).setStyle({ height: '30px' }),
            node.button('rightx2', '>>', dialogButtonClass).setStyle({ height: '30px' })
        ]),
        node.div()
            .setChildren(['日', '一', '二', '三', '四', '五', '六'].map(d => node.div().setClass('inline-flex justify-center items-center').setText(d).setStyle(gridStyle))),
        node.div()
            .setChildren(['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'].map(d => node.div().setClass('inline-flex justify-center items-center').setText(d).setStyle(gridStyle))),
        node.div('dateData')
    ])
    content.getChildById('leftx2').on('click', _ => content.__prevYear())
    content.getChildById('left').on('click', _ => content.__prevMonth())
    content.getChildById('right').on('click', _ => content.__nextMonth())
    content.getChildById('rightx2').on('click', _ => content.__nextYear())
    let buttons = []
    let btn = node.button('', 'OK', dialogButtonClass)
    let reset = node.button('', 'Reset', dialogButtonClass)
    btn.on('click', () => {
        dig.remove()
        callback(content.getCurrentDate())
    })
    reset.on('click', () => content.__chooseCurrentDate())
    buttons.push(reset)
    buttons.push(btn)
    let dig = dialog('Date Picker', content, buttons, essentialDialogStyle, width, height, callback)
    return dig
}

const color = (essentialDialogStyle, colorClass, width, height, callback) => {
    let { dialogButtonClass } = essentialDialogStyle

    let content = (new ColorPicker(colorClass)).setChildren([
        node.div().setStyle({ display: 'inline-flex', background: '#333', }).setChildren([
            node.canvas('singleColor').setSize(255, 255).setupDrawCode(ctx => { ctx.fillStyle = '#333'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height) }),
            node.canvas('allColor').setSize(40, 255).setupDrawCode(ctx => { ctx.fillStyle = '#666'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height) })
        ]),
        node.div().setStyle({ display: 'flex', justifyContent: 'space-between' }).setChildren([
            node.div().setStyle({ display: 'flex' }).setChildren([
                node.div('currentColor').setStyle({
                    display: 'inline-flex',
                    width: '25px',
                    height: '25px',
                    background: 'red',
                    borderRadius: '4px',
                    border: '1px solid white',
                    outline: '1px solid gray',
                    marginLeft: '7px'
                })
            ]),
            node.div().setStyle({ display: 'flex' }).setChildren([
                node.div('colorLabel').setText('rgb(255,0,0)').setStyle({ padding: '0 2px', width: '155px', background: '#CCC', borderRight: '1px solid #333' }),
                node.div('hexColorLabel').setText('#ff0000').setStyle({ padding: '0 2px', width: '95px', background: '#CCC' }),
            ])
        ])
    ])
    content.__singleColor = content.getChildById('singleColor').setStyle({ cursor: 'crosshair' })
    content.__allColor = content.getChildById('allColor').setStyle({ cursor: 'crosshair' })
    content.__currentColor = content.getChildById('currentColor')
    content.__colorLabel = content.getChildById('colorLabel')
    content.__hexColorLabel = content.getChildById('hexColorLabel')
    content.__createSingleColorSpectrum('red')
    content.__createMultiColorSpectrum()

    let buttons = []
    let btn = node.button('', 'OK', dialogButtonClass)
    let reset = node.button('', 'Reset', dialogButtonClass)
    btn.on('click', () => {
        let imgData = content.__singleColor.getContext().getImageData(content.x, content.y, 1, 1).data;
        dig.remove()
        callback({ r: imgData[0], g: imgData[1], b: imgData[2] })
    })
    reset.on('click', () => content.reset())
    buttons.push(reset)
    buttons.push(btn)
    let dig = dialog('Color Picker', content, buttons, essentialDialogStyle, width, height, callback)
    return dig
}

// essential button. if you set pageId, then you will switch to router mode
const button = (id, label, className, pageId, activeClassName = 'active') => {
    const btn = node.div(id).setClass(className).setText(label)
    btn.routerPageId = pageId
    if (pageId) {
        const update = () => {
            if (location.href.split('/#/')[1]?.indexOf(pageId) > -1) {
                btn.getParent().getChildren().forEach(e => {
                    e.setClass(className)
                })
                btn.setClass(className + ' ' + activeClassName)
            }
        }
        btn.on('click', () => { router.go(pageId); update() })
        requestAnimationFrame(update)
    }
    return btn
}

// divimg
function divimg(id, src) {
    return node.div(id).setStyle({ background: `url(${getAssetsPath(src)})` })
}

// 🟠 preparing
const pageer = (id, proxyData) => {
    if (!id) id = getUniqueId()
}

//  proxy prop watcher
function proxy(storeField) {

    let save = [] // leave page restore save data
    let step = 1

    //  page leave watcher
    let storeHref = location.href
    let pageObserver = () => {
        if (location.href != storeHref) {
            step = 2
            window.removeEventListener('popstate', pageObserver)
        }
    }
    window.addEventListener('popstate', pageObserver)

    // proxy oberver
    let items = new Proxy([], {

        set: (obj, prop, val) => {

            if (!items.update) {
                obj[prop] = val

                // pure data without view
                if (prop == '0')
                    storeField[prop] = val
                return true
            }

            // console.log(obj, prop, val)

            if (prop == 'length') {

                if (val) {
                    obj.length = val
                    storeField.length = val
                    // console.log('noval-other', storeField, [...obj])

                } else {
                    obj.length = val
                    // console.log('🍉 length', storeField, storeField.length)

                    if (storeField.length > 0) {
                        // console.log('------------clear', storeField, '---step', step)
                        save = [...storeField]
                        storeField.length = 0
                        items.update()
                        items.first.__update()

                        requestAnimationFrame(() => {
                            if (step == 1) {
                                storeField.length = 0
                                save.length = 0
                                items.state = null
                            } else {
                                // change page
                                let len = save.length
                                if (len > 0) {
                                    storeField.length = 0
                                    for (let i = 0; i < len; i++) {
                                        storeField[i] = save[i]
                                    }
                                }
                            }
                        })
                        return true
                    }
                }

                return true
            }

            let index = parseInt(prop)
            if (!isNaN(index)) {

                // console.log('index', index, items.length, obj.length, storeField.length, val)
                if (obj[index] && index < items.length) {
                    // update
                    // console.log('isNaN', 1, index)

                    if (index == 0 || !items.state[0]) {
                        if (!items.state) {
                            // console.log('update input')
                            return true
                        }

                        if (!items.state[0]) {
                            items.state = ['update', index]
                        }

                        // console.log(items.state, items)

                        switch (items.state[0]) {
                            case 'shift':
                                storeField.shift()
                                break
                            case 'unshift':
                                storeField.unshift(val)
                                storeField.pop()
                                break
                            case 'removeAt':
                                storeField.splice(items.state[1], 1)
                                break
                            case 'addAt':
                                storeField.splice(items.state[1], 0, val)
                                break
                            case 'update':
                                storeField.splice(items.state[1], 1)
                                storeField.splice(items.state[1], 0, val)
                                break
                            // case 'updateInput':
                            //     storeField[0] = val
                            //     break;
                        }

                        items.state = []

                        let itemsLen = storeField.length
                        for (let i = 0; i < itemsLen; i++) {
                            obj[i] = storeField[i]
                        }
                        // update
                        items.update()
                    }

                    return true
                }

                // empty array and addChildAt
                if (obj.length == 0 && index > 0) {
                    console.log('isNaN', 2)
                    obj[prop] = val
                    obj.length = 0
                    return true
                }

                if (items.type == 'input') { // special for textarea & input
                    obj[prop] = val
                } else {
                    storeField.push(val)
                    obj[prop] = val
                    // console.log('new ', storeField)
                }

                items.state = []
                items.update()

                return true
            }

            obj[prop] = val

            return true
        }
    })

    // fill data from stores
    storeField.forEach(i => items.push(i))

    return items
}

// assets' path
function getAssetsPath(assetSrc) {
    if (location.host.indexOf('127.0.0.1') > -1 || location.host.indexOf('localhost') > -1)
        return location.protocol + '//' + location.host + '/assets/' + assetSrc;
    else if (location.host.indexOf('github') > -1)
        return location.protocol + '//' + location.host + '/chill.js/assets/' + assetSrc;
    return ''
}

/** 可使用在不同層級資料溝通, different component level communication */
class PubSub {

    static __allsub = {}

    static subscribe(msgTitle, subscriber) {
        if (!PubSub.__allsub[msgTitle]) {
            PubSub.__allsub[msgTitle] = [subscriber]
        } else {
            PubSub.__allsub[msgTitle].push(subscriber)
        }
        subscriber.token = getUniqueId()
        return subscriber.token
    }

    static publish(msgTitle, data) {
        PubSub.__allsub[msgTitle].forEach(subscriber => {
            subscriber(/*msgTitle,*/ data)
        });
    }

    // PubSub.unsubscribe(token); // delete 1
    // PubSub.unsubscribe(mySubscriber); // delete all
    static unsubscribe(tokenOrSubscriber) {
        if (typeof tokenOrSubscriber == 'function') {
            // delete subscriber
            Object.keys(PubSub.__allsub).forEach(msgTitle => {
                PubSub.__allsub[msgTitle] = PubSub.__allsub[msgTitle].filter(subscriber => subscriber != tokenOrSubscriber)
            })
        } else {
            // delete token
            Object.keys(PubSub.__allsub).forEach(msgTitle => {
                PubSub.__allsub[msgTitle] = PubSub.__allsub[msgTitle].filter(subscriber => subscriber.token != tokenOrSubscriber)
            })
        }
    }

    // clearAll - call this function when change page, and then subscribe again in new page 
    static clearAllSubscriptions() {
        Object.keys(PubSub.__allsub).forEach(msgTitle => {
            PubSub.__allsub[msgTitle].length = 0
            delete PubSub.__allsub[msgTitle]
        })
    }

}

/** node is a core functions set, which can build basic ui */
export const node = {
    /** 取得資源位址 */
    getAssetsPath,
    /** 取得目前頁面所有有 tid 的物件，適用於跨不同層級元件呼叫使用 */
    getPageNodes: () => nodes,
    /** 取得目前頁面指定 tid 的物件，適用於跨不同層級元件呼叫使用 */
    getPageNodeById: (id) => nodes.filter(n => n.getId() == id)[0],
    /** 取得 root 節點 */
    app: () => NodeBase.__app,
    /** 取得 div 節點 */
    div: (id) => new Div(id),
    /** 取得 span 節點 */
    span: (id) => new Span(id),
    /** 取得 水平線 節點 */
    hr: (id) => new HRule(id),
    /** 取得 h1 ~ h6 節點 */
    h: (id, level) => new Head(id, level),
    /** 取得 img 節點 */
    img: (id) => new Img(id),
    /** 取得 div img 節點 */
    divimg,
    /** 取得 select 節點 */
    vm_select,
    /** 取得 canvas 節點 */
    canvas: (id) => new Canvas(id),
    /** 取得 vm input 節點 */
    vm_input: (id, data, type) => new Input(id, data, type), // model view
    /** 取得 vm textarea 節點 */
    vm_textarea: (id, data) => new TextArea(id, data), // model view
    /** 取得 vm list 節點，多筆資料使用 */
    vm_list: (id, item_tpl, datas) => new VMList(id, item_tpl, datas), // model view
    /** 取得 vm single 節點，單筆資料使用，可想為僅一個資料的陣列 */
    vm_single: (id, item_tpl, datas) => new VMSingle(id, item_tpl, datas), // model view
    /** 生成檔案選取按鈕 */
    file: (id, label, className, readerMode, callback) => new FilePicker(id, label, className, readerMode, callback),
    /** 滾動條, policy (0 = vertical / 1 = horizontal / 2 = both) */
    scroller,
    /** 一般按鈕或是路由按鈕 */
    button,
    /** 對話框基底 */
    dialog,
    /** 日期選擇器 */
    date,
    /** 顏色選擇器 */
    color,
    /** dialog 延伸的警告視窗 */
    alert,
    /** dialog 延伸的確認視窗 */
    confirm,
    /** 針對 vm_list 篩選顯示資料 */ // 🟠 尚未開發
    pageer,
    /** 將資料轉為 View Model 間溝通的橋樑，使用方法如 node.proxy(store.data.xxxx...) */
    proxy,
    /** 跨元件溝通 */
    pubsub: PubSub,
}