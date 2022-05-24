// 函数节流，通过全局timer
export function throttle(fn, delay = 300) {
    let t = null;
    return function () {
        if (t) return;
        t = setTimeout(() => {
            fn.call(this)
            t = null;
        }, delay);
    }
}

// 函数节流，通过时间戳
export function throttle1(fn, wait = 300) {
    let last = 0;
    return function () {
        var now = new Date().getTime();;
        if (now - last > wait) {
            fn.call(this);
            last = new Date().getTime();;
        }
    }
}

// 函数防抖
export function debounce(fn, delay = 300) {
    let timer = null
    // 所以这个函数就可以使用...运算符收集js自动添加的参数到一个数组中
    return function (...arg) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            // 通过apply绑定this和传递参数，apply第二个参数正好是传数组
            fn.apply(this, arg)
        }, delay)
    }
}

//判断是否为手机媒体
export const isPhonePortrait = () => {
    return window.matchMedia('(max-width: 600px) and (orientation: portrait)').matches;
}

//是手机设备？
export const isMB = () => /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);

//从sessionStorage中加载album_id
export const initAlbumId = () => {
    const album_id = window.sessionStorage.getItem("album_id");
    if (album_id) {
        return +album_id
    } else {
        window.sessionStorage.setItem("album_id", -1)
        return -1;
    }
}

//语法糖，获取元素top值
export const getElementTop = (element) => {
    let actualTop = element.offsetTop;
    let current = element.offsetParent;
    while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }
    return actualTop;
}

//语法糖 滚动条距离顶部的距离
export const get_scrollTop_of_body = () => {
    let scrollTop;
    if (typeof window.pageYOffset != 'undefined') {//pageYOffset指的是滚动条顶部到网页顶部的距离
        scrollTop = window.pageYOffset;
    } else if (typeof document.compatMode !== 'undefined' && document.compatMode !== 'BackCompat') {
        scrollTop = document.documentElement.scrollTop;
    } else if (typeof document.body != 'undefined') {
        scrollTop = document.body.scrollTop;
    }
    return scrollTop;
}

//语法糖，判断是否为刷新页面
export const isReload = () => {
    if (window.name === "sunylive") {
        return true
    }
    return false
}

//语法糖，判断元素是否在窗口内
export const isElementInViewport = (el) => {
    //获取元素是否在可视区域
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
        (window.innerWidth || document.documentElement.clientWidth)
    );
}

//语法糖，判断滚动条是否已到底部
export const isScrollInBottom = (el) => {
    const clientHeight = el.clientHeight;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    return clientHeight + scrollTop === scrollHeight;
}


//创建pswp窗口
export const getContainer = () => {
    const pswpContainer = document.createElement('div');
    pswpContainer.style.background = '#000';
    pswpContainer.style.width = '100%';
    pswpContainer.style.height = '100%';
    pswpContainer.style.display = 'none';
    document.body.appendChild(pswpContainer);
    return pswpContainer;
}

//获取全屏API
export const getFullscreenAPI = () => {
    let api;
    let enterFS;
    let exitFS;
    let elementFS;
    let changeEvent;
    let errorEvent;

    if (document.documentElement.requestFullscreen) {
        enterFS = 'requestFullscreen';
        exitFS = 'exitFullscreen';
        elementFS = 'fullscreenElement';
        changeEvent = 'fullscreenchange';
        errorEvent = 'fullscreenerror';
    } else if (document.documentElement.webkitRequestFullscreen) {
        enterFS = 'webkitRequestFullscreen';
        exitFS = 'webkitExitFullscreen';
        elementFS = 'webkitFullscreenElement';
        changeEvent = 'webkitfullscreenchange';
        errorEvent = 'webkitfullscreenerror';
    }

    if (enterFS) {
        api = {
            request: function (el) {
                if (enterFS === 'webkitRequestFullscreen') {
                    el[enterFS](Element.ALLOW_KEYBOARD_INPUT);
                } else {
                    el[enterFS]();
                }
            },

            exit: function () {
                return document[exitFS]();
            },

            isFullscreen: function () {
                return document[elementFS];
            },

            change: changeEvent,
            error: errorEvent
        };
    }

    return api;
};

//全屏svg icon
export const fullscreenSVG = '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 32 32" width="32" height="32"><use class="pswp__icn-shadow" xlink:href="#pswp__icn-fullscreen-exit"/><use class="pswp__icn-shadow" xlink:href="#pswp__icn-fullscreen-request"/><path d="M8 8v6.047h2.834v-3.213h3.213V8h-3.213zm9.953 0v2.834h3.213v3.213H24V8h-2.834zM8 17.953V24h6.047v-2.834h-3.213v-3.213zm13.166 0v3.213h-3.213V24H24v-6.047z" id="pswp__icn-fullscreen-request"/><path d="M11.213 8v3.213H8v2.834h6.047V8zm6.74 0v6.047H24v-2.834h-3.213V8zM8 17.953v2.834h3.213V24h2.834v-6.047h-2.834zm9.953 0V24h2.834v-3.213H24v-2.834h-3.213z" id="pswp__icn-fullscreen-exit" style="display:none"/></svg>';