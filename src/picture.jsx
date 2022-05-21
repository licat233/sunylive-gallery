import { useEffect, useRef } from "react";

export default function Picture(props) {
    const lastRef = useRef();
    useEffect(() => {
        if (props.isLast) {
            props.setLastPicture(lastRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let { url, width, height, thumb_url } = props.image;
    if (width < 1920 || height < 1080) {
        width = width * 10
        height = height * 10
    }
    const size = width + "x" + height;
    const mark = width < height ? "vertical" : "horizontal";

    return <>
        <figure className={ "gallery-item " + mark} itemProp="associatedMedia" itemScope="" itemType="http://schema.org/ImageObject">
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
                <img ref={lastRef} className="lazyload fadein"
                    src="data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http://www.w3.org/2000/svg'%20viewBox%3D'0%200%201000%20500'%20%2F%3E"
                    data-src={thumb_url}
                    itemProp="thumbnail"
                    alt="壁纸来源网络和网友分享，图片版权归原作者所有，若有侵权问题敬请告知我们（licat233@gmail.com），我们会尽快处理。"
                />
            </a>
            <figcaption className="gallery-caption" itemProp="caption description">SUNYLIVE</figcaption>
        </figure>
    </>
}