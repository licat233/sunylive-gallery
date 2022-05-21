import { useEffect, useState, useRef } from "react";
import { requestImages, requestAlbums } from './api/api';
import Picture from './picture';
import 'lazysizes';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import './gallery.css';
import LocomotiveScroll from 'locomotive-scroll';
import "./navigation.css";
import "./lib/locomotive-scroll.css";

export default function Gallery(props) {
    const slogan_cn = "中国高端工匠木作代表品牌";
    const slogan_en = "Representative brand of Chinese high-end craftsman woodwork";

    const albumId = useRef(0);
    const page = useRef(0);
    const [albums, setAlbums] = useState([]);
    const [images, setImages] = useState([]);
    const hasAlbums = useRef(false);
    const galleryRef = useRef();
    const last_picture = useRef();
    const navRef = useRef();
    const navBoxRef = useRef();
    const globalScroll = useRef(null);

    const initAlbums = async () => {
        if (hasAlbums.current) return;
        hasAlbums.current = true
        const data = await requestAlbums()
        if (Array.isArray(data)) setAlbums(data);
    }


    const checkHeaderPosition = () => {
        if (!navRef.current || !navBoxRef.current) return
        const headerHeight = navRef.current.offsetHeight;
        //滚动条距离顶部的距离
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        //【元素顶部】距离dom顶部的距离 = 父盒子到offsetParent顶部的距离 + 父盒子高度 - 自身高度
        let offset = navBoxRef.current.offsetTop + navBoxRef.current.offsetHeight - headerHeight;
        if (scrollTop > offset) {
            navRef.current.classList.add("nav-container--top-second");
        } else {
            navRef.current.classList.remove("nav-container--top-second");
        }
    }

    const reqAlbumId = useRef(-1); //请求过的相册id
    const reqPage = useRef(-1); //请求过的page
    const lastPage = useRef(99);
    // const imagesStore = useRef([]);
    const updateImages = async (isReset = false) => {
        //相同的请求，不再执行
        if (reqAlbumId.current === albumId.current && reqPage.current === page.current) return console.log("相同的请求");
        //不同的请求，配置请求相册id和页码
        reqAlbumId.current = albumId.current;
        reqPage.current = page.current;
        //判断是否已经是最后一页
        if (lastPage.current !== -1 && reqPage.current >= lastPage.current) return console.log("已经是最后一页");
        //配置请求参数
        const params = { page: reqPage.current, order: "earliest", album_id: reqAlbumId.current, permission: "public" }
        //开始发起请求
        const result = await requestImages(params)
        //请求完成后
        //判断当前请求是否为最新需要的
        //判断请求期间，相册id是否已经被更改，如果被更改，当前请求不做任何回调处理
        if (reqAlbumId.current !== albumId.current) return console.log("相册id已经被更改");
        //设置当前相册的最大页码
        lastPage.current = result.last_page;
        //设置当前的页码+1
        page.current++
        //新增到images中
        const reqImages = result.data;
        if (Array.isArray(reqImages)) {
            if (isReset) {
                setImages(reqImages);
            } else {
                setImages([...images, ...reqImages]);
            }
        } else {
            console.log("获取images数据失败：", reqImages)
        }
    }

    const lastActiveTab = useRef(null);
    //导航栏点击事件
    const clickNav = (e) => {
        if (lastActiveTab.current !== e.target) {
            lastActiveTab.current && lastActiveTab.current.classList.remove("active");
            lastActiveTab.current = e.target
            lastActiveTab.current.classList.add("active");
        }
        const album_id = e.target.dataset.id
        if (typeof album_id === "undefined") return console.log("获取相册id失败");
        //如果是相同的相册，则不重复处理
        if (albumId.current === album_id) return;
        //重置页码
        page.current = 1;
        //重置最大页码
        lastPage.current = -1;
        //设置新的相册id
        albumId.current = album_id;
        //传入true，重置images
        updateImages(true);
    }

    const initScroll = () => {
        console.log(globalScroll.current)
        if (!globalScroll.current) {
            globalScroll.current = new LocomotiveScroll({
                el: document.querySelector('#root'),
                smooth: true
            });
            globalScroll.current.init();
            globalScroll.current.on('scroll', (args) => {
                onScroll()
            })
        } else {
            globalScroll.current.update()
        }
    }

    //scroll事件
    const onScroll = () => {
        checkHeaderPosition();
        //相较监听滚动条位置的最佳方案
        if (!last_picture.current) return console.log("最后一个元素不存在");
        if (last_picture.current.dataset.block) return console.log("最后一个元素已block");
        if (last_picture.current.classList.contains("lazyloaded")) {
            last_picture.current.dataset.block = "load"
            // page.current++
            updateImages()
        } else {
            console.log("最后一个元素没有被触发");
        }
    }

    const photoswipe = useRef();
    const initPhotoSwipe = () => {
        if (photoswipe.current) return;
        photoswipe.current = new PhotoSwipeLightbox({
            gallery: '#gallery',
            children: 'figure',
            pswpModule: () => import('photoswipe'),
        });
        photoswipe.current.init();
    }

    useEffect(() => {
        initAlbums() //初始化相册
        // initScroll() //初始化scroll
        window.addEventListener('resize', onScroll); //监听窗口变化
        window.addEventListener('scroll', onScroll);// 监听滚动条时间
        initPhotoSwipe(); //初始化photoswipe
        return () => {
            window.removeEventListener('resize', onScroll);
            window.removeEventListener('scroll', onScroll);
            // globalScroll.current.destroy();
        }
        // eslint-disable-next-line
    }, []);

    const setLastPicture = (ele) => {
        //设置最后一个picture
        last_picture.current = ele;
    }

    return (
        <>
            <div className="navigationContainer">
                <section id="nav" className="nav" ref={navBoxRef}>
                    <h1>SUNYLIVE GALLERY</h1>
                    <h3 className="span loader">
                        {slogan_cn.split("").map((word, index) => <span className="m" key={index}>{word}</span>)}
                    </h3>
                    <h3 className="span loader loader_en">{slogan_en.split("").map((word, index) => <span className="m" key={index}>{word}</span>)}</h3>
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
                    <div className="time-control">
                        <div className="ruller">
                            {Array.apply(null, Array(300)).map((_, i) =>
                                <div key={"line" + i} className="line" style={{ transform: "translateY(0px)" }}></div>
                            )}
                        </div>
                    </div>
                    <div className="nav-container" ref={navRef}>
                        {albums.map((album, index) => {
                            return <div className="nav-tab" data-id={album.id} onClick={clickNav} key={album.id + "-" + index}>{album.name}</div>
                        })}
                        <span className="nav-tab-slider"></span>
                    </div>
                </section>
                <canvas className="background"></canvas>
            </div>
            <div className="galleryContainer">
                <div ref={galleryRef} className="gallery" id="gallery" itemScope="" itemType="http://schema.org/ImageGallery">
                    {images.map((image, index) => <Picture key={albumId.current + "-" + index} image={image} isLast={images.length === index + 1} setLastPicture={setLastPicture} />)}
                </div>
            </div>
        </>)
}
