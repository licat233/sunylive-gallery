import { useState, useEffect, useRef, useReducer, useContext } from "react";
import { requestAlbums } from '../api/api';
import { defaultState, reducer } from './reducer';
import LocomotiveScroll from 'locomotive-scroll';
import { globalContext } from '../App';
import "./navigation.css";
import "./lib/locomotive-scroll.css";

export default function Navigation(props) {
    const [albums, setAlbums] = useState([])
    const slogan_cn = "中国高端工匠木作代表品牌";
    const slogan_en = "Representative brand of Chinese high-end craftsman woodwork";
    let hasAlbums = false;

    const { setAlbumId } = useContext(globalContext)
    // const [state, dispatch] = useReducer(reducer, defaultState)

    const clickNav = (e) => {
        const album_id = e.target.dataset.id
        if (typeof album_id === "undefined") return
        setAlbumId(album_id)
        // setGlobalState({ ...globalState, currentAlbumI: album_id })
        // globalState.clickNavEvent(album_id)
        // state.current_album_id = album_id
        // dispatch(defaultState);
        // setCurrentAlbumId(album_id);
    }

    const initAlbums = async () => {
        if (hasAlbums) return;
        hasAlbums = true
        const data = await requestAlbums()
        if (Array.isArray(data)) setAlbums(data);
    }


    const navRef = useRef();
    const navBoxRef = useRef();
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
    const onScroll = () => {
        checkHeaderPosition();
    }
    const onResize = () => {
        window.addEventListener('resize', onScroll);
    }

    const globalScroll = useRef(null);
    // const navtabScroll = useRef(null);
    const initLocomotiveScroll = () => {
        if (!globalScroll.current) {
            globalScroll.current = new LocomotiveScroll();
            globalScroll.current.init();
            globalScroll.current.on('scroll', (args) => {
                onScroll()
            })
        } else {
            globalScroll.current.update()
        }
        // if (!navtabScroll.current && navRef.current) {
        //     navtabScroll.current = new LocomotiveScroll({
        //         el: navRef.current,
        //         smooth: true
        //     });
        //     navtabScroll.current.init();
        // }else{
        //     navtabScroll.current.update();
        // }
        // 监听滚动条
        // window.addEventListener('scroll', onScroll);
    }

    useEffect(() => {
        initAlbums()
        initLocomotiveScroll()
        onResize()
        return () => {
            // globalScroll.current.destroy()
        }
        // eslint-disable-next-line
    }, []);

    // const ruller = () => {
    //     return (
    //         <div className="ruller">
    //             {Array.apply(null, Array(272)).map((i) =>
    //                 <div key={i} className="line" style="transform: translateY(0px);"></div>
    //             )}
    //         </div>
    //     )
    // }

    return <div className="navigationContainer">
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
                    {Array.apply(null, Array(272)).map((_, i) =>
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
    </div>
}