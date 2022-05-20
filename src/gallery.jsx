import { useEffect, useState, useContext, useRef } from "react";
import { requestImages } from './api/api';
import Picture from './picture';
import { Ctx } from './App';
import 'lazysizes';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import './gallery.css';

export default function Gallery(props) {
    const { state: { current_album_id } } = useContext(Ctx)
    const [page, setPage] = useState(1);
    const [images, setImages] = useState([]);
    const [params, setParams] = useState({ page: page, order: "earliest", album_id: current_album_id, permission: "public" });
    const galleryRef = useRef();
    const last_picture = useRef();

    let lastPage = 99;
    let reqBlock = false;
    const updateImages = async () => {
        if (reqBlock) return;
        if (page >= lastPage) return;
        reqBlock = true;
        const reqAlbum_id = params.album_id
        const reqPage = params.page
        const result = await requestImages(params)
        reqBlock = false
        if (reqAlbum_id !== params.album_id) return
        if (reqPage !== params.page) return
        lastPage = result.last_page;
        setPage(result.current_page)
        console.log(result);
        if (Array.isArray(result.data)) {
            setImages(result.data);
        }
    }

    const onScroll = () => {
        //相较监听滚动条位置的最佳方案
        if (last_picture.current && last_picture.current.dataset.block) return;
        if (last_picture.current.classList.contains("lazyloaded")) {
            last_picture.current.dataset.block = "load"
            params.page++
            setParams({ ...params })
            updateImages()
        }
    }

    const setLastPicture = (ele) => {
        //设置最后一个picture
        last_picture.current = ele;
    }
    useEffect(() => {
        if (!reqBlock) {
            updateImages();
        }
        // 监听滚动条时间
        window.addEventListener('scroll', onScroll);

        return () => {
            updateImages();
            window.addEventListener('scroll', onScroll, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reqBlock])

    useEffect(() => {
        let lightbox = new PhotoSwipeLightbox({
            gallery: '#gallery',
            children: 'figure',
            pswpModule: () => import('photoswipe'),
        });
        lightbox.init();

        return () => {
            lightbox.destroy();
            lightbox = null;
        };
    }, []);

    return (<>
        <div ref={galleryRef} className="gallery" id="gallery" itemScope="" itemType="http://schema.org/ImageGallery">
            {images.map((image, index) => <Picture key={current_album_id + "-" + index} image={image} isLast={images.length === index + 1} setLastPicture={setLastPicture} />)}
        </div>
    </>)
}
