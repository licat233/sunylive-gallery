import { useEffect, useRef } from "react";
import 'lazysizes';

export default function Picture(props) {
    const imgRef = useRef();

    const figureRef = useRef();
    // useEffect(() => {
    //     figureRef.current.addEventListener('contextmenu', function (e) {
    //         e.preventDefault();
    //         // 执行代码块
    //         console.log(this)
    //     })
    // }, [])

    useEffect(() => {
        if (props.isLast) {
            props.setLastPicture(imgRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let { url, width, height, thumb_url, id } = props.image;
    if (width < 1920 || height < 1080) {
        width = width * 10
        height = height * 10
    }
    const size = width + "x" + height;
    const mark = width < height ? "vertical" : "horizontal";

    return <>
        <figure ref={figureRef} className={"gallery-item " + mark} itemProp="associatedMedia" id={id} itemScope="" itemType="http://schema.org/ImageObject">
            <a href={url}
                itemProp="contentUrl"
                data-size={size}
                data-pswp-src={url}
                data-pswp-width={width}
                data-pswp-height={height}
                data-cropped="true"
                target="_blank"
                rel="noreferrer"
            >
                <img ref={imgRef} className="gallery-img lazyload fadein" width={width} height={height}
                    src="data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http://www.w3.org/2000/svg'%20viewBox%3D'0%200%201000%20500'%20%2F%3E"
                    data-src={thumb_url}
                    itemProp="thumbnail"
                    alt="部分图片来源网络和网友分享，图片版权归原作者所有，若有侵权问题敬请告知我们（licat233@gmail.com），我们会尽快处理。"
                />
            </a>
            <figcaption className="gallery-caption" itemProp="caption description">SUNYLIVE</figcaption>
        </figure>
    </>
}