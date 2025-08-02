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
        Object.keys(styleObj).forEach(k => {
            this.__tag.style[k] = styleObj[k]
        })
        return this
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
    on(eventName, execFun) {
        const event = e => { execFun(e, this) }
        event.exe = execFun
        this.__tag.addEventListener(eventName, event)
        this.__eventList.push({ eventName, event })
        return this
    }

    /** delete event */
    off(eventName, execFun) {
        let e = this.__eventList.filter(e => e.eventName == eventName && e.event.exe == execFun)[0]
        if (!e) return this
        let index = this.__eventList.findIndex(ev => ev == e)
        console.log(index)
        this.__tag.removeEventListener(e.eventName, e.event)
        this.__eventList.splice(index, 1)
        return this
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
        if (location.host.indexOf('127') > -1 || location.host.indexOf('localhost') > -1)
            this.__tag.src = location.protocol + '//' + location.host + '/assets/' + src;
        else this.__tag.src = location.protocol + '//' + location.host + '/chill.js/assets/' + src;
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
        super.remove()
        if (this.__item.vms.length == 1) {
            this.__item.vms.length = 0 //
            this.__item.vms = null
        }
        this.__item.update = null
        this.__item.length = 0
        delete this.__item
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
        super.remove()
        if (this.__item.vms.length == 1) {
            this.__item.vms.length = 0 //
            this.__item.vms = null
        }
        this.__item.update = null
        this.__item.length = 0
        delete this.__item
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
    constructor(dateClass) {
        super()
        // tid && (this.__id = tid)
        // tid && this.__tag.setAttribute('tid', this.__id)
        this.__setup()
    }

    __setup() {

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
            items.isZero = false // 🟠
            return pushRef(item)
        }

        // initialize
        items.forEach(item => {
            this.pushChild(item)
        })

        // pop
        let popRef = items.pop.bind(this)
        items.pop = () => {
            items.state = ['pop']
            if (items.length) {
                this.popChild()
                items.length = items.length - 1
                items.update()
                if (items.length == 0) items.isZero = true // 🟠
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
                if (items.length == 0) items.isZero = true // 🟠
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
            items.isZero = false // 🟠
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
        items.update = () => this.__update(items)

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
            items.isZero = false // 🟠
            return pushRef(item)
        }

        // initialize
        items.forEach(item => {
            this.pushChild(item)
        })

        // pop
        let popRef = items.pop.bind(this)
        items.pop = () => {
            items.state = ['pop']
            if (items.length) {
                this.popChild()
                items.length = items.length - 1
                items.update()
                if (items.length == 0) items.isZero = true // 🟠
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

// dialog
const dialog = (title, contentNode, buttons = [], essentialDialogStyle, width, height, callback) => {
    let { dialogTitleClass, dialogBodyClass, dialogBottonGroupClass, dialogButtonClass } = essentialDialogStyle
    let transparentCover = node.div().setStyle({
        display: 'flex',
        width: '100vw',
        height: '100vh',
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
            document.removeEventListener('keyup', quit)
        }
    }
    document.addEventListener('keyup', quit)
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

// essential button. if you set pageId, then you will switch to router mode
const button = (tid, label, className, pageId, activeClassName = 'active') => {
    const btn = node.div(tid).setClass(className).setText(label)
    btn.routerPageId = pageId
    if (pageId) {
        btn.on('click', () => router.go(pageId))
        requestAnimationFrame(() => {
            if (location.href.split('/#/')[1]?.indexOf(pageId) > -1) {
                btn.getParent().getChildren().forEach(e => {
                    e.setClass(className)
                })
                btn.setClass(className + ' ' + activeClassName)
            }
        })
    }
    return btn
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

/** node is a core functions set, which can build basic ui */
export const node = {
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
    /** 取得 img 節點 */
    img: (id) => new Img(id),
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
    /** 一般按鈕或是路由按鈕 */
    button,
    /** 對話框基底 */
    dialog,
    /** 日期選擇器 */
    date,
    /** dialog 延伸的警告視窗 */
    alert,
    /** dialog 延伸的確認視窗 */
    confirm,
    /** 將資料轉為 View Model 間溝通的橋樑，使用方法如 node.proxy(store.data.xxxx...) */
    proxy,
}