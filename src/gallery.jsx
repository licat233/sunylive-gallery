import { useEffect, useState, useRef } from "react";
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import 'lazysizes';
import { writeStorage, useLocalStorage } from '@rehooks/local-storage';
import scrollto from 'jquery.scrollto';
import { requestImages, requestAlbums, requestImgs } from './api/api';
import { initAlbumId, throttle, getElementTop, get_scrollTop_of_body, isReload, isElementInViewport, getContainer, getFullscreenAPI, fullscreenSVG } from './utils/utils';
import Footer from './footer/footer';
import Picture from './picture';
import "./css/navigation.css";
import './css/gallery.css';
import './css/star.css';
import './css/share.css';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QRious from 'qrious';
// import tippy from 'tippy.js';
// import 'tippy.js/dist/tippy.css';

// import BScroll from '@better-scroll/core'
// import MouseWheel from '@better-scroll/mouse-wheel'
// BScroll.use(MouseWheel)

export default function Gallery(props) {
    const slogan_cn = "中国高端工匠木作代表品牌";
    const slogan_en = "Representative brand of Chinese high-end craftsman woodwork";
    const albumId = useRef(initAlbumId()); //默认显示收藏夹
    const page = useRef(0);
    const [albums, setAlbums] = useState([]);
    const [images, setImages] = useState([]);
    const [showLoading, setShowLoading] = useState(false);
    const hasAlbums = useRef(false);
    const galleryRef = useRef();
    const last_picture = useRef();
    const navRef = useRef();
    const navBoxRef = useRef();
    const reqAlbumId = useRef(-1); //请求过的相册id
    const reqPage = useRef(-1); //请求过的page
    const lastPage = useRef(99);
    const galleryContainer = useRef();
    const lastActiveTab = useRef();
    const collectRef = useRef();
    const imageStorage = useRef([]);
    const navigationContainer = useRef();
    const loadRef = useRef();
    const [localImages, setLocalImages, deleteLocalImages] = useLocalStorage('collectImages', []);
    const collectImages = useRef([]);
    const contentRef = useRef();
    const photoswipe = useRef();

    const initAlbums = async () => {
        if (hasAlbums.current) return;
        hasAlbums.current = true
        const data = await requestAlbums()
        if (Array.isArray(data)) {
            let filterData = data.filter(item => item.image_num !== 0)
            setAlbums(filterData)
        };
    }

    /**
     * 关于收藏栏的数据：
     * 如果有hash，则优先加载hash的数据，并且首屏自动跳转到收藏栏目下
     * 否则使用localStorage
     */

    const isHashData = useRef(false)
    const getCollectImages = async () => {
        let hash = window.location.hash
        if (!hash) {
            //加载localstorage数据
            initCollectImages()
            return
        }
        hash = hash.substring(1);
        //例：share=[1,2,3]
        const items = hash.split("&");
        const pattern = /^share=\[(\d,?)+\]$/
        let share = "";
        for (let i = 0; i < items.length; i++) {
            const str = items[i];
            if (pattern.test(str)) {
                share = str
                break
            }
        }
        if (share === "" || share.length < 8) {
            //加载localstorage数据
            initCollectImages()
            return
        }
        //提取id
        const idstr = share.slice(7, share.length - 1)
        const idss = idstr.split(",");
        //检查id是否都符合要求，如果不符合
        if (idss.some(id => id.length === 0 || Number(id).toString() === 'NaN')) {
            //加载localstorage数据
            initCollectImages()
            return
        }

        //加载hash数据
        isHashData.current = true;
        const ids = idss.map(id => Number(id));
        //请求数据
        const images = await requestImgs({ ids })
        if (!Array.isArray(images)) {
            const alertMsg = new window.AlertClass();
            alertMsg.show({
                title: '错误',
                content: '加载错误，请刷新网页或者稍后重试!!',
                onHide: function () {
                }
            })
            return
        }
        collectImages.current = images;
        //如果加载的是hash数据，则自动跳转到收藏栏目下
        toPhotoSwipe()
        //展示图片
        imageStorage.current = [...collectImages.current];
        setImages([...imageStorage.current]);
    }

    //初始化收藏图片
    const initCollectImages = () => {
        if (!Array.isArray(localImages)) {
            deleteLocalImages([]);
            setLocalImages([]);
        } else {
            collectImages.current = [...localImages];
        }
    }

    let collectDataStatus = useRef(false);
    //数据初始化
    useEffect(() => {
        if (collectDataStatus.current) return;
        collectDataStatus.current = true;
        getCollectImages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectDataStatus.current])

    //监听nav tab位置
    const onNavTabPosition = () => {
        if (!navRef.current) return
        const headerHeight = navRef.current.offsetHeight;
        //滚动条距离顶部的距离
        // const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollTop = get_scrollTop_of_body();
        //【元素顶部】距离dom顶部的距离 = 父盒子到offsetParent顶部的距离 + 父盒子高度 - 自身高度
        let offset = navBoxRef.current.offsetTop + navBoxRef.current.offsetHeight - headerHeight;
        if (scrollTop > offset) {
            navRef.current.classList.add("nav-container--top-second");
        } else {
            navRef.current.classList.remove("nav-container--top-second");
        }
    }

    //滑动到gallery
    const toPhotoSwipe = () => {
        contentRef.current.style.display = "block";
        window.name = "sunylive";
        const targetScroll = getElementTop(galleryContainer.current) - navRef.current.offsetHeight
        scrollto(window).scrollTo(targetScroll, {
            axis: 'y',
            duration: 400
        });
    }

    //鼠标点击下滑按钮
    const onMouseScroll = () => {
        toPhotoSwipe()
        //展现相册图片
        if (imageStorage.current.length === 0) {
            showAlbumImages()
        }
    }

    // const imagesStore = useRef([]);
    const updateImages = async (type = "update") => {
        //相同的请求，不再执行
        if (reqAlbumId.current === albumId.current && reqPage.current === page.current) return //console.log("相同的请求");
        //不同的请求，配置请求相册id和页码
        reqAlbumId.current = albumId.current;
        reqPage.current = page.current;
        //判断是否已经是最后一页
        if (lastPage.current !== -1 && reqPage.current >= lastPage.current) return //console.log("已经是最后一页");
        //展现loading动画
        setShowLoading(true);
        //配置请求参数
        const params = { page: reqPage.current, order: "earliest", album_id: reqAlbumId.current, permission: "public" }
        //开始发起请求
        const result = await requestImages(params)
        //请求完成后
        //判断当前请求是否为最新需要的
        //判断请求期间，相册id是否已经被更改，如果被更改，当前请求不做任何回调处理
        if (reqAlbumId.current !== albumId.current) return //console.log("相册id已经被更改");
        //设置当前相册的最大页码
        lastPage.current = result.last_page;
        //设置当前的页码+1
        page.current++
        //新增到images中
        const reqImages = result.data;

        //校验数据
        if (Array.isArray(reqImages)) {
            if (type === "reset") {
                imageStorage.current = [...reqImages];
                setImages([...imageStorage.current]);
            } else {
                imageStorage.current = [...imageStorage.current, ...reqImages]
                setImages([...imageStorage.current]);
            }
            // console.log("当前storage:", imageStorage.current)
        } else {
            throw new Error("获取images数据失败：", reqImages)
        }
        //隐藏loading动画
        setShowLoading(false);
    }

    //切换到指定tab
    const switchTab = (target) => {
        if (lastActiveTab.current !== target) {
            lastActiveTab.current && lastActiveTab.current.classList.remove("active");
            lastActiveTab.current = target
            lastActiveTab.current.classList.add("active");
        }
    }

    //显示当前相册图片
    const showAlbumImages = () => {
        //-1表示收藏夹
        if (albumId.current === -1) {
            //此处加载收藏夹内存数据
            imageStorage.current = [...collectImages.current];
            setImages([...imageStorage.current]);
            reqAlbumId.current = albumId.current;
            reqPage.current = page.current++;
            return;
        }
        //传入reset，重置images
        updateImages("reset");
    }

    //导航栏点击事件
    const clickNav = (e) => {
        // console.log(e.target)
        //滑动到gallery区域
        toPhotoSwipe();
        if (typeof e.target.dataset.id === "undefined") return console.log("获取相册id失败");
        const album_id = +e.target.dataset.id
        //如果是相同的相册，则不重复处理
        if (lastActiveTab.current === e.target) return// console.log("相同的相册");
        //停止所有的请求，基本上都是图片请求
        window.stop();
        //切换标签
        switchTab(e.target);
        //清空images
        setImages([])
        //重置页码
        page.current = 1;
        //重置最大页码
        lastPage.current = -1;
        //设置新的相册id
        albumId.current = album_id;
        //缓存到本地
        window.sessionStorage.setItem("album_id", albumId.current)
        //展现相册图片
        showAlbumImages()
    }

    //加载更多图片
    const loadMoreImages = () => {
        //如果是收藏栏，不需要加载更多
        if (albumId.current === -1) return
        //滑动到底部，把最后一个标记一下
        //相较监听滚动条位置的最佳方案
        if (!last_picture.current) return //console.log("最后一个元素不存在");
        if (last_picture.current.dataset.block === "true") return //console.log("最后一个元素已block");
        // if (last_picture.current.classList.contains("lazyloaded")) { //旧方案，需要等到图片加载完才能继续
        if (isElementInViewport(last_picture.current)) {
            last_picture.current.dataset.block = "true";
            updateImages()
        }
    }

    //初始化收藏按钮
    const initCollectBtn = (pswp, currentIndex, btnE) => {
        const btnEl = btnE || pswp.element.querySelector(".pswp__button--collect");
        const index = currentIndex ?? pswp.options.index;
        btnEl.dataset.index = index;
        const image = imageStorage.current[index];
        if (!image) return;
        const exist = collectImages.current.some(img => img.id === image.id);
        if (exist) {
            btnEl.innerHTML = "已收藏";
            btnEl.style.color = "var(--color0a)"
        } else {
            btnEl.innerHTML = "收藏";
            btnEl.style.color = "";
        }
    }

    const hasCollectImage = (image_id) => {
        image_id = +image_id //转化为 number 类型
        const image = imageStorage.current.find((img => img.id === image_id))
        if (!image) return null;
        return collectImages.current.some(img => img.id === image.id);
    }

    const changeCollectImageHandler = (image_id, saveHandler, cancelHandelr) => {
        image_id = +image_id //转化为 number 类型
        const image = imageStorage.current.find((img => img.id === image_id))
        if (!image) return;
        const exist = collectImages.current.some(img => img.id === image.id);
        //不存在，则保存
        if (!exist) {
            saveHandler();
            collectImages.current.push(image);
        } else {
            cancelHandelr();
            //移除
            const deleteIndex = collectImages.current.findIndex(img => {
                return img.id === image.id
            })
            if (deleteIndex !== -1) {
                collectImages.current.splice(deleteIndex, 1)
            }
        }
        //如果加载的是hash数据，收藏或者取消收藏的时候，应该只是操作了hash数据，不能动到localstrage数据
        //如果当前加载的是hash数据，则不应该把hash数据覆盖保存到本地
        if (isHashData.current) {
            return
        }
        //持久化到本地存储
        writeStorage('collectImages', collectImages.current);
    }

    //改变收藏按钮样式
    const changeCollectBtnStyle = (btnE, currentIndex) => {
        const index = currentIndex ?? btnE.dataset.index;
        const image = imageStorage.current[index];
        if (!image) return;
        const exist = collectImages.current.some(img => img.id === image.id);
        if (!exist) {
            btnE.innerHTML = "已收藏";
            btnE.style.color = "var(--color0a)"
            collectImages.current.push(image);
        } else {
            btnE.innerHTML = "收藏";
            btnE.style.color = "";
            //移除
            const deleteIndex = collectImages.current.findIndex(img => {
                return img.id === image.id
            })
            if (deleteIndex !== -1) {
                collectImages.current.splice(deleteIndex, 1)
            }
        }

        //如果加载的是hash数据，收藏或者取消收藏的时候，应该只是操作了hash数据，不能动到localstrage数据
        //如果当前加载的是hash数据，则不应该把hash数据覆盖保存到本地
        if (isHashData.current) {
            return
        }
        //持久化到本地存储
        writeStorage('collectImages', collectImages.current);
    }

    const initPhotoSwipe = () => {
        if (photoswipe.current) return;
        const fullscreenAPI = getFullscreenAPI();
        const pswpContainer = getContainer();
        // Toggle full-screen mode function
        function toggleFullscreen() {
            if (fullscreenAPI) {
                if (fullscreenAPI.isFullscreen()) {
                    // Exit full-screen mode
                    fullscreenAPI.exit();
                    // Toggle "Exit" and "Enter" full-screen SVG icon display
                    setTimeout(function () {
                        document.getElementById('pswp__icn-fullscreen-exit').style.display = 'none';
                        document.getElementById('pswp__icn-fullscreen-request').style.display = 'inline';
                    }, 300);
                } else {
                    // Enter full-screen mode
                    fullscreenAPI.request(document.querySelector(`.pswp`));
                    // Toggle "Exit" and "Enter" full-screen SVG icon display
                    setTimeout(function () {
                        document.getElementById('pswp__icn-fullscreen-exit').style.display = 'inline';
                        document.getElementById('pswp__icn-fullscreen-request').style.display = 'none';
                    }, 300);
                }
            }
        }

        const options = {
            gallery: '#gallery',
            children: 'figure',
            pswpModule: () => import('photoswipe'),
        };

        photoswipe.current = new PhotoSwipeLightbox(options);
        photoswipe.current.on('close', () => {
            if (albumId.current === -1) {
                //此处加载收藏夹内存数据
                imageStorage.current = [...collectImages.current];
                setImages([...imageStorage.current]);
            }
            pswpContainer.style.display = 'none';
            if (fullscreenAPI && fullscreenAPI.isFullscreen()) {
                fullscreenAPI.exit();
            }
        });
        photoswipe.current.on('uiRegister', function () {
            //收藏按钮
            photoswipe.current.pswp.ui.registerElement({
                name: 'collect',
                ariaLabel: 'Toggle zoom',
                order: 7,
                isButton: true,
                html: '收藏',
                onInit: function (el, pswp) {
                    initCollectBtn(pswp, null, el);
                },
                onClick: (event, el) => {
                    changeCollectBtnStyle(el);
                }
            });
            //全屏按钮
            photoswipe.current.pswp.ui.registerElement({
                name: 'fullscreen-button',
                title: 'Toggle fullscreen',
                order: 8,
                isButton: true,
                html: fullscreenSVG,
                onClick: (event, el) => {
                    toggleFullscreen();
                }
            });
            //缩放级别
            photoswipe.current.pswp.ui.registerElement({
                name: 'zoom-level-indicator',
                order: 10,
                onInit: (el, pswp) => {
                    pswp.on('zoomPanUpdate', (e) => {
                        if (e.slide === pswp.currSlide) {
                            el.innerText = Math.round(pswp.currSlide.currZoomLevel * 100) + '%';
                        }
                    });
                }
            });

            //大屏看图时修改收藏按钮
            photoswipe.current.pswp.ui.registerElement({
                name: 'renderCollectBtn',
                appendTo: 'wrapper',
                onInit: (el, pswp) => {
                    pswp.on('change', () => {
                        initCollectBtn(pswp, pswp.currIndex);
                    });
                }
            });

        });
        photoswipe.current.addFilter('contentErrorElement', (contentErrorElement, content) => {
            const el = document.createElement('div');
            el.className = 'pswp__error-msg';
            el.innerHTML = `<strong>该图片无法加载</strong>`;
            return el;
        });
        photoswipe.current.init();
    }

    //渲染导航栏
    const renderNavTab = () => {
        return <>
            <div className="nav-container" ref={navRef}>
                <div className={albumId.current === -1 ? "nav-tab active" : "nav-tab"} data-id={-1} ref={collectRef} onClick={clickNav} key="collect">收藏</div>
                {albums.map((album, index) => {
                    const name = albumId.current === album.id ? "nav-tab active" : "nav-tab";
                    return <div className={name} data-id={album.id} onClick={clickNav} key={album.id + "-" + index}>{album.name}</div>
                })}
                <span className="nav-tab-slider"></span>
            </div>
        </>
    }

    // const navScroll = useRef();
    // const navtabTemplate = () => {
    //     return (<>
    //         <div className="newNavTab" ref={navRef}>
    //             <div className="mouse-wheel-wrapper" ref={navScroll} >
    //                 <div className="mouse-wheel-content">
    //                     <div className={"nav-tab mouse-wheel-item " + (albumId.current === -1 ? "active" : "")} data-id={-1} ref={collectRef} onClick={clickNav} key="my-collect">收藏</div>
    //                     {albums.map((album, index) => {
    //                         return <div className={"nav-tab mouse-wheel-item " + (album.id === albumId.current ? "active" : "")} data-id={album.id} onClick={clickNav} key={album.id + "-" + index}>{album.name}</div>
    //                     })}
    //                 </div>
    //             </div>
    //         </div>
    //     </>)
    // }

    // const navBS = useRef(null);
    // const initNavScroll = () => {
    //     if (navBS.current)  return //navBS.current.refresh();

    //     navBS.current = new BScroll(navScroll.current, {
    //         scrollX: true,
    //         scrollY: false,
    //         mouseWheel: true
    //     })
    // }
    // useEffect(() => {
    //     if (albums.length !== 0) {
    //         initNavScroll(); //初始化滑动条
    //     }
    // }, [albums])

    //初始化nav大小
    const initNavSize = () => {
        navBoxRef.current.style.width || (navBoxRef.current.style.width = window.innerWidth + "px");
        navBoxRef.current.style.height || (navBoxRef.current.style.height = window.innerHeight + "px");
    }

    //自适应nav大小
    const cacheWidth = useRef(window.innerWidth)
    const autoNavSize = () => {
        if (cacheWidth.current === window.innerWidth) return
        cacheWidth.current = window.innerWidth
        navBoxRef.current.style.width = window.innerWidth + "px";
        navBoxRef.current.style.height = window.innerHeight + "px";
    }

    //窗口改变事件
    const onResize = () => {
        autoNavSize();
    }

    //滚动条事件
    const onScroll = () => {
        onNavTabPosition();
        throttle(() => {
            cancelMenuByScroll();
            loadMoreImages();
        })()
    }

    const initContentDisplay = () => {
        if (false && isReload()) {
            contentRef.current.style.display = "block";
            showAlbumImages();
        } else {
            contentRef.current.style.display = "none";
        }
    }

    useEffect(() => {
        initPhotoSwipe(); //初始化photoswipe
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        initNavSize() //初始化nav大小
        initAlbums() //初始化相册
        initContentDisplay() //初始化内容区
        // initCollectImages() //初始化collectImages数据
        window.addEventListener('resize', onResize); //监听窗口变化
        window.addEventListener('scroll', onScroll);// 监听滚动条，注意：用了LocomotiveScroll，这里就不生效了
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onScroll);
            photoswipe.current && photoswipe.current.destroy();
            photoswipe.current = null;
        }
        // eslint-disable-next-line
    }, []);

    //设置最后一个picture
    const setLastPicture = (ele) => {
        last_picture.current = ele;
    }

    const loading = () => {
        if (!showLoading) return <></>
        const text = "LOADING"
        return (
            <div className="load-box" ref={loadRef} >
                <div id="load">
                    {text.split("").reverse().map((word, index) => <div key={index} style={{ animationDelay: 0.2 * index + "s" }}>{word}</div>)}
                </div>
            </div>
        )
    }

    const genShareLink = () => {
        const ids = collectImages.current.map(img => img.id)
        const hashValue = "#share=[" + ids.join(",") + "]";
        return window.location.protocol + "//" + window.location.host + hashValue;
    }
    const copyState = useRef(false);
    const [shareLink, setShareLink] = useState(genShareLink());
    const [collectNum, setCollectNum] = useState(collectImages.current.length);
    const shareRef = useRef(null);
    const closeRef = useRef(null);
    const qrcanvasRef = useRef(null);
    const shareState = () => {
        return shareRef.current.className.search("active") !== -1
    }
    const onShare = () => {
        if (shareState()) {
            shareRef.current.classList.remove("active")
            closeRef.current.classList.remove("active")
        } else {
            setCollectNum(collectImages.current.length)
            const link = genShareLink();
            setShareLink(link)
            genQR(link)
            shareRef.current.classList.add("active")
            closeRef.current.classList.add("active")
        }
    }

    const copyRef = useRef(null);
    // const tippyRef = useRef(null);
    // const copyTips = () => {
    //     tippyRef.current = tippy(copyRef.current, {
    //         // default
    //         content: '复制成功',
    //         trigger: 'click',
    //         placement: 'bottom',
    //         animation: 'fade',
    //         arrow: true,
    //         theme: 'light',
    //         delay: [0, 800], // ms
    //     });
    // }

    const qrRef = useRef(null)
    // useEffect(() => {
    //     if (!tippyRef.current) {
    //         copyTips()
    //     }

    // }, [])

    useEffect(() => {
        if (!qrRef.current) {
            genQR(shareLink);
        }
    }, [shareLink])

    const genQR = (link) => {
        qrRef.current = new QRious({
            element: qrcanvasRef.current,
            value: link
        });
    }

    let resetCopyTimer = null
    const onCopy = () => {
        resetCopyTimer && clearTimeout(resetCopyTimer);
        copyRef.current.innerHTML = "成功复制链接";
        copyRef.current.classList.add("copysuccess");
        resetCopyTimer = setTimeout(() => {
            copyRef.current.classList.remove("copysuccess");
            copyRef.current.innerHTML = "复制分享链接";
        }, 3000)
    }

    const shareTemplate = () => {
        if (albumId.current !== -1) return <></>;

        return (
            <div className="share-container">
                <div className="share-content">
                    <div className="share" ref={shareRef}>
                        <div className="toggle" onClick={onShare}><span>分享收藏</span></div>
                        <button type="button" className="close" ref={closeRef} onClick={onShare}>
                            <span className="bar"></span>
                            <span className="bar"></span>
                        </button>
                        <div className="content">
                            <div className="text">
                                <ul>
                                    <li>收藏数量 <span>{collectNum}</span></li>
                                    <li></li>
                                </ul>

                                <div className="shareQR"><canvas ref={qrcanvasRef} /></div>
                                <p className="sharelink">{shareLink}</p>
                                <CopyToClipboard text={shareLink}
                                    onCopy={() => copyState.current = true}>
                                    <span className="sharelinkBtn" ref={copyRef} onClick={onCopy}>复制分享链接</span>
                                </CopyToClipboard>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const findFigureE = (ele) => {
        if (!ele) return null;
        if (ele.tagName === 'FIGURE') return ele;
        if (ele.tagName !== 'A' && ele.tagName !== 'IMG') return null;
        return findFigureE(ele.parentElement);
    }

    const cancelRightMenuTimer = useRef(null)
    const mouseoverHandler = (e) => {
        // console.log("鼠标进入")
        // console.log(e);
        clearTimeout(cancelRightMenuTimer.current);
    }

    const mouseoutHandler = (e) => {
        // console.log("鼠标离开")
        // console.log(e);
        // 1 秒钟之后消失
        clearTimeout(cancelRightMenuTimer.current);
        cancelRightMenuTimer.current = setTimeout(() => {
            cancelRightMenu()
        }, 600)
    }

    const rightMenuRef = useRef();
    const collectItemRef = useRef();
    //隐藏菜单
    const cancelRightMenu = () => {
        rightMenuRef.current.style.display = 'none';
    }

    const markScrollTop = useRef(null);
    const rightClickHandler = function (e) {
        e = e || window.event;
        //屏蔽默认样式
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
        //获取坐标
        let x = e.clientX;
        let y = e.clientY;

        //获取屏幕大小
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        //右键菜单窗口的宽高
        const menuWidth = 90;
        const menuHeight = 30;

        //计算视口的位置
        if (screenWidth - x < menuWidth) {
            x -= menuWidth;
        }
        if (screenHeight - y < menuHeight) {
            y -= menuHeight;
        }

        //设置坐标
        rightMenuRef.current.style.top = y + 'px';
        rightMenuRef.current.style.left = x + 'px';

        // 执行代码块
        const figureE = findFigureE(e.target);
        // console.log(figureE);
        if (!figureE) return;
        const image_id = figureE.dataset.id;
        if (!image_id) return;
        rightMenuRef.current.dataset.imageId = image_id;
        //初始化样式
        if (hasCollectImage(image_id)) {
            saveMenuStyle();
        } else {
            cancelMenuStyle();
        }
        //标记当前 scrollTop
        markScrollTop.current = document.documentElement.scrollTop || document.body.scrollTop;

        //显示菜单
        rightMenuRef.current.style.display = 'block';
    }

    //当滚动超过一定距离，菜单就会消失
    const cancelMenuByScroll = () => {
        if (markScrollTop.current === null) return;
        const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        if (Math.abs(currentScrollTop - markScrollTop.current) > 150) {
            cancelRightMenu();
            markScrollTop.current = null;
        }
    }

    const saveMenuStyle = () => {
        collectItemRef.current.innerText = "取消收藏";
        collectItemRef.current.style.color = "red";
    }

    const cancelMenuStyle = () => {
        collectItemRef.current.innerText = "添加收藏";
        collectItemRef.current.style.color = "";
    }

    const changeCollectImageByMenuHandler = () => {
        const image_id = rightMenuRef.current.dataset.imageId;
        if (!image_id) return console.log("丢失目标图片id");
        changeCollectImageHandler(image_id, saveMenuStyle, cancelMenuStyle);
    }

    const initRightClickMenu = useRef(false);

    useEffect(() => {
        if (initRightClickMenu.current) return;
        initRightClickMenu.current = true;
        // window.document.addEventListener("click", () => {
        //     //隐藏菜单
        //     cancelRightMenu();
        // });
        let liEs = rightMenuRef.current.querySelectorAll("ul li");
        liEs.forEach(li => {
            li.onmouseover = mouseoverHandler
            li.onmouseout = mouseoutHandler
        })
        // eslint-disable-next-line
    }, [])

    return (
        < >
            <div className="navigationContainer" ref={navigationContainer}>
                <section id="nav" className="nav" ref={navBoxRef}>
                    <div className="ruler-box">
                        <div className="ruler">
                            {Array.apply(null, Array(300)).map((_, i) =>
                                <div key={"line" + i} className="line" style={{ transform: "translateY(0px)" }}></div>
                            )}
                        </div>
                    </div>
                    <h1>SUNYLIVE GALLERY</h1>
                    <h3 className="span loader">
                        {slogan_cn.split("").map((word, index) => <span className="m" style={{ animationDelay: 0.15 * index + "s" }} key={index}>{word}</span>)}
                    </h3>
                    <h3 className="span loader loader_en">{slogan_en.split("").map((word, index) => <span className="m" style={{ animationDelay: 0.05 * index + "s" }} key={index}>{word}</span>)}</h3>
                    <div className="waves-box">
                        <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28"
                            preserveAspectRatio="none" shapeRendering="auto">
                            <defs>
                                <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                            </defs>
                            <g className="parallax">
                                <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
                                <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                                <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                                <use xlinkHref="#gentle-wave" x="48" y="7" fill="rgba(255,255,255,1)" />
                            </g>
                        </svg>
                    </div>
                    <div className="scroll-tool">
                        <div className="MouseScroll" onClick={onMouseScroll}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" version="1.1">
                                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                    <g fill="#ffaa00b3">
                                        <path d="M40,41.0074017 L40,41.0074017 L40,58.9925983 C40,64.5218355 44.4762336,69 50,69 C55.5234877,69 60,64.5203508 60,58.9925983 L60,41.0074017 C60,35.4781645 55.5237664,31 50,31 C44.4765123,31 40,35.4796492 40,41.0074017 L40,41.0074017 Z M38,41.0074017 C38,34.3758969 43.3711258,29 50,29 C56.627417,29 62,34.3726755 62,41.0074017 L62,58.9925983 C62,65.6241031 56.6288742,71 50,71 C43.372583,71 38,65.6273245 38,58.9925983 L38,41.0074017 L38,41.0074017 Z"></path>
                                        <path d="M49,36 L49,40 C49,40.5522847 49.4477153,41 50,41 C50.5522847,41 51,40.5522847 51,40 L51,36 C51,35.4477153 50.5522847,35 50,35 C49.4477153,35 49,35.4477153 49,36 L49,36 Z"></path>
                                        <path d="M50,81.9929939 L55.4998372,76.4931567 C55.8903615,76.1026324 56.5235265,76.1026324 56.9140508,76.4931567 C57.3045751,76.883681 57.3045751,77.516846 56.9140508,77.9073703 L50.7071068,84.1143143 C50.5118446,84.3095764 50.2559223,84.4072075 50,84.4072075 C49.7440777,84.4072075 49.4881554,84.3095764 49.2928932,84.1143143 L43.038379,77.8598002 C42.6478547,77.4692759 42.6478547,76.8361109 43.038379,76.4455866 C43.4289033,76.0550623 44.0620683,76.0550623 44.4525926,76.4455866 L50,81.9929939 Z" className="MouseScroll--chevron"></path>
                                    </g>
                                </g>
                            </svg>
                        </div>
                    </div>
                    {/* {navtabTemplate()} */}
                    {renderNavTab()}
                    <canvas className="background" />
                </section>
            </div>

            <section ref={contentRef} className="contentContainer">
                <div className="galleryContainer galleryBox gallery-wrapper" ref={galleryContainer}>
                    {/* <canvas className="background" /> */}
                    {shareTemplate()}
                    <div className="gallery-content">
                        <div ref={galleryRef} onContextMenu={rightClickHandler} className="gallery" id="gallery" itemScope="" itemType="http://schema.org/ImageGallery">
                            {images.map((image, index) => <Picture key={albumId.current + "-" + index + "-" + image.id} index={index} image={image} isLast={images.length === index + 1} setLastPicture={setLastPicture} />)}
                        </div>
                    </div>
                    {loading()}
                </div>
                <Footer />
                <div className="star-background">
                    <div id="stars"></div>
                    <div id="stars2"></div>
                    <div id="stars3"></div>
                </div>
            </section>
            <section ref={rightMenuRef} className="rightclickmenu">
                <ul>
                    <li ref={collectItemRef} onClick={changeCollectImageByMenuHandler} className="collectItem">添加收藏</li>
                </ul>
            </section>
        </>)
}
// 
