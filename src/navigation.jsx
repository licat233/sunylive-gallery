import { useState, useEffect, useRef, useReducer } from "react";
import { requestAlbums } from './api/api';
import { defaultState, reducer } from './reducer'
import "./navigation.css";

export default function Navigation() {
    const [albums, setAlbums] = useState([])
    const slogan_cn = "中国高端工匠木作代表品牌";
    const slogan_en = "Representative brand of Chinese high-end craftsman woodwork";
    let hasAlbums = false;

    const [state, dispatch] = useReducer(reducer, defaultState)

    const clickNav = (e) => {
        const album_id = e.target.dataset.id
        if (typeof album_id === "undefined") return
        state.current_album_id = album_id
        dispatch({ ...state });
        console.log("点击了nav：", album_id)
    }

    const initAlbums = async () => {
        if (hasAlbums) return;
        hasAlbums = true
        const data = await requestAlbums()
        if (Array.isArray(data)) setAlbums(data);
    }
    useEffect(() => {
        if (!hasAlbums) {
            initAlbums()
        }
        onScroll();
        return () => {
            initAlbums()
        }
        // eslint-disable-next-line
    }, [hasAlbums]);

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

    useEffect(() => {
        // 监听滚动条时间
        window.addEventListener('scroll', onScroll);
        return () => {
            window.addEventListener('scroll', onScroll, false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])



    return <>
        <section className="nav" ref={navBoxRef}>
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
            <div className="nav-container" ref={navRef}>
                {albums.map((album, index) => {
                    return <div className="nav-tab" data-id={album.id} onClick={clickNav} key={index}>{album.name}</div>
                })}
                <span className="nav-tab-slider"></span>
            </div>
        </section>
        <canvas className="background"></canvas>

    </>
}