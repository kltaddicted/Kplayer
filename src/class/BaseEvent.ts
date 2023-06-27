export type EventObject = {
    [props: string]: Function[]
}
export class BaseEvent {
    $events: EventObject = {}
    constructor() { }
    //事件触发
    emit(event: string, ...args: any[]) {
        this.$events[event].forEach((cb) => {
            //调用函数
            cb.call(this, ...args)
        })
    }

    //事件绑定
    on(event: string, cb: Function) {
        this.$events[event] = this.$events[event] || [];
        //将事件加入事件栈
        this.$events[event].push(cb);
    }

    //取消事件绑定
    off(event: string, cb: Function) {
        if (this.$events[event]) {
            this.$events[event] = this.$events[event].filter(fn => {
                if (fn == cb) {
                    return false
                }
                return true
            })
        }
    }
}