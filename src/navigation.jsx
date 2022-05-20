import { useState, useEffect } from "react";
import "./navigation.css";
import requestAlbums from './api';

export default function Navigation() {
    const [albums, setAlbums] = useState([])
    const slogan = "中国高端工匠木作代表品牌";
    let hasAlbums = false;
    const clickNav = (e) => {
        const album_id = e.target.dataset.id
        if (typeof album_id === "undefined") return
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
        return () => {

        }
        // eslint-disable-next-line
    }, [hasAlbums]);

    return <>
        <section className="nav">
            <h1>SUNYLIVE<br />GALLERY</h1>
            <h3 className="span loader">
                {slogan.split("").map((word, index) => <span className="m" key={index}>{word}</span>)}
            </h3>
            <div className="nav-container">
                {albums.map((album, index) => {
                    return <div className="nav-tab" data-id={album.id} onClick={clickNav} key={index}>{album.name}</div>
                })}
                <span className="nav-tab-slider"></span>
            </div>
        </section>
        <canvas className="background"></canvas>
    </>
}