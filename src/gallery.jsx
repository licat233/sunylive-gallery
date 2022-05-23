import { useEffect, useState, useRef } from "react";
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import 'lazysizes';
// import LocomotiveScroll from 'locomotive-scroll';
// import "./lib/locomotive-scroll.css";
import { writeStorage, useLocalStorage } from '@rehooks/local-storage';
import $ from 'jquery.scrollto';
import { requestImages, requestAlbums } from './api/api';
import Footer from './footer/footer';
import Picture from './picture';
import "./css/navigation.css";
import './css/gallery.css';
import './css/star.css';

const initAlbumId = () => {
    const album_id = window.sessionStorage.getItem("album_id");
    if (album_id) {
        return +album_id
    } else {
        window.sessionStorage.setItem("album_id", -1)
        return -1;
    }
}

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
    // const smoothScroll = useRef(null); //平滑滚动条
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

    const initAlbums = async () => {
        if (hasAlbums.current) return;
        hasAlbums.current = true
        const data = await requestAlbums()
        if (Array.isArray(data)) setAlbums(data);
    }

    //滚动条距离顶部的距离
    const get_scrollTop_of_body = () => {
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

    // const navOffset = useRef(-1);
    //监听nav tab位置
    const onNavTabPosition = () => {
        if (!navRef.current) return
        const headerHeight = navRef.current.offsetHeight;
        //滚动条距离顶部的距离
        // const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        //【元素顶部】距离dom顶部的距离 = 父盒子到offsetParent顶部的距离 + 父盒子高度 - 自身高度
        let offset = navBoxRef.current.offsetTop + navBoxRef.current.offsetHeight - headerHeight;
        if (get_scrollTop_of_body() > offset) {
            navRef.current.classList.add("nav-container--top-second");
        } else {
            navRef.current.classList.remove("nav-container--top-second");
        }
    }

    //语法糖，获取元素top值
    const getElementTop = (element) => {
        var actualTop = element.offsetTop;
        var current = element.offsetParent;
        while (current !== null) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    }

    //滑动到gallery
    const toPhotoSwipe = () => {
        contentRef.current.style.display = "block";
        window.name = "sunylive";
        const targetScroll = getElementTop(galleryContainer.current) - navRef.current.offsetHeight
        $(window).scrollTo(targetScroll, {
            axis: 'y',
            duration: 400
        });
        // smoothScroll.current.scrollTo(targetScroll)
    }

    const isReload = () => {
        if (window.name === "sunylive") {
            return true
        }
        return false
    }

    const initScreen = () => {
        if (isReload()) {
            contentRef.current.style.display = "block";
        } else {
            contentRef.current.style.display = "none";
        }
    }

    useEffect(() => {
        initScreen()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const switchTab = (target) => {
        if (lastActiveTab.current !== target) {
            lastActiveTab.current && lastActiveTab.current.classList.remove("active");
            lastActiveTab.current = target
            lastActiveTab.current.classList.add("active");
        }
    }

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
        //滑动到gallery区域
        toPhotoSwipe();
        if (typeof e.target.dataset.id === "undefined") return console.log("获取相册id失败");
        const album_id = +e.target.dataset.id
        //如果是相同的相册，则不重复处理
        if (lastActiveTab.current === e.target) return// console.log("相同的相册");
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


    //语法糖，判断元素是否在窗口内
    const isElementInViewport = (el) => {
        //获取元素是否在可视区域
        var rect = el.getBoundingClientRect();
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
    // const isScrollInBottom = (el) => {
    //     const clientHeight = el.clientHeight;
    //     const scrollTop = el.scrollTop;
    //     const scrollHeight = el.scrollHeight;
    //     return clientHeight + scrollTop === scrollHeight;
    // }


    const loadMoreImages = () => {
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

    //photoSwipe的工具
    // const isPhonePortrait = () => {
    //     return window.matchMedia('(max-width: 600px) and (orientation: portrait)').matches;
    // }

    const getContainer = () => {
        const pswpContainer = document.createElement('div');
        pswpContainer.style.background = '#000';
        pswpContainer.style.width = '100%';
        pswpContainer.style.height = '100%';
        pswpContainer.style.display = 'none';
        document.body.appendChild(pswpContainer);
        return pswpContainer;
    }
    const getFullscreenAPI = () => {
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

    const changeCollectBtn = (btnE, currentIndex) => {
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
            btnE.style.color = ""
            //移除
            const deleteIndex = collectImages.current.findIndex(img => {
                return img.id === image.id
            })
            if (deleteIndex !== -1) {
                collectImages.current.splice(deleteIndex, 1)
            }
        }
        //持久化到本地存储
        writeStorage('collectImages', collectImages.current);
    }


    const photoswipe = useRef();
    const initPhotoSwipe = () => {
        if (photoswipe.current) return;
        const fullscreenSVG = '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 32 32" width="32" height="32"><use class="pswp__icn-shadow" xlink:href="#pswp__icn-fullscreen-exit"/><use class="pswp__icn-shadow" xlink:href="#pswp__icn-fullscreen-request"/><path d="M8 8v6.047h2.834v-3.213h3.213V8h-3.213zm9.953 0v2.834h3.213v3.213H24V8h-2.834zM8 17.953V24h6.047v-2.834h-3.213v-3.213zm13.166 0v3.213h-3.213V24H24v-6.047z" id="pswp__icn-fullscreen-request"/><path d="M11.213 8v3.213H8v2.834h6.047V8zm6.74 0v6.047H24v-2.834h-3.213V8zM8 17.953v2.834h3.213V24h2.834v-6.047h-2.834zm9.953 0V24h2.834v-3.213H24v-2.834h-3.213z" id="pswp__icn-fullscreen-exit" style="display:none"/></svg>';
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
                    changeCollectBtn(el);
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

    const onResize = () => {
        onNavTabPosition()
        navBoxRef.current.style.width = window.innerWidth + "px";
        navBoxRef.current.style.height = window.innerHeight + "px";
    }

    const onScroll = () => {
        onNavTabPosition();
        loadMoreImages();
    }

    // 初始化 locomotiveScroll
    // const initLocomotiveScroll = () => {
    //     if (smoothScroll.current) {
    //         smoothScroll.current.update();
    //         return
    //     }
    //     smoothScroll.current = new LocomotiveScroll({
    //         el: document.querySelector("#root"),
    //         smooth: true,
    //     });
    //     smoothScroll.current.on("scroll", () => {
    //         onScroll()
    //     })
    // }

    const initCollectImages = () => {
        if (!Array.isArray(localImages)) {
            deleteLocalImages([]);
            setLocalImages([]);
        } else {
            collectImages.current = [...localImages];
        }
    }

    const initShowAlbumImages = () => {
        //如果是刷新页面，则显示图片
        if (isReload()) {
            showAlbumImages()
        }
    }

    const renderNavTab = () => {
        return <>
            <div className={albumId.current === -1 ? "nav-tab active" : "nav-tab"} data-id={-1} ref={collectRef} onClick={clickNav} key="collect">收藏</div>
            {albums.map((album, index) => {
                const name = albumId.current === album.id ? "nav-tab active" : "nav-tab";
                return <div className={name} data-id={album.id} onClick={clickNav} key={album.id + "-" + index}>{album.name}</div>
            })}
        </>
    }

    useEffect(() => {
        initAlbums() //初始化相册
        initCollectImages() //初始化collectImages数据
        initShowAlbumImages() //初始化显示的图片
        onResize();
        initPhotoSwipe(); //初始化photoswipe
        window.addEventListener('resize', onResize); //监听窗口变化
        window.addEventListener('scroll', onScroll);// 监听滚动条，注意：用了LocomotiveScroll，这里就不生效了
        // initLocomotiveScroll(); //初始化LocomotiveScroll
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onScroll);
            photoswipe.current && photoswipe.current.destroy();
            photoswipe.current = null;
        }
        // eslint-disable-next-line
    }, []);

    // useEffect(() => {
    //     smoothScroll.current && smoothScroll.current.update();
    // })

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

    return (
        <>
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
                    <div className="nav-container" ref={navRef}>
                        {renderNavTab()}
                        <span className="nav-tab-slider"></span>
                    </div>
                    <canvas className="background" />
                </section>
            </div>

            <section ref={contentRef} className="contentContainer">
                <div className="galleryContainer galleryBox" ref={galleryContainer}>
                    {/* <canvas className="background" /> */}
                    <div ref={galleryRef} className="gallery" id="gallery" itemScope="" itemType="http://schema.org/ImageGallery">
                        {images.map((image, index) => <Picture key={albumId.current + "-" + index + "-" + image.id} image={image} isLast={images.length === index + 1} setLastPicture={setLastPicture} />)}
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
        </>)
}
