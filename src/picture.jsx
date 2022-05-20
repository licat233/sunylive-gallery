export default function Picture(props) {
    if (!props.image) return <></>;
    const { href, width, height, thumb_url } = props.image;
    if (width < 1920 || height < 1080) {
        width = width * 10
        height = height * 10
    }
    const size = width + "x" + height;
    const mark = width < height ? "vertical" : "horizontal";
    return <>
        <figure className={"gallery-item " + mark} itemprop="associatedMedia" itemscope="" itemtype="http://schema.org/ImageObject">
            <a href={href}
                itemprop="contentUrl"
                data-size={size}
                data-pswp-src={href}
                data-pswp-width={width}
                data-pswp-height={height}
                data-cropped="true"
                target="_blank"
            >
                <img className="lazyload lazypreload fadein"
                    src="data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http://www.w3.org/2000/svg'%20viewBox%3D'0%200%201000%20500'%20%2F%3E"
                    data-src={thumb_url}
                    itemprop="thumbnail"
                    alt="壁纸来源网络和网友分享，图片版权归原作者所有，若有侵权问题敬请告知我们（licat233@gmail.com），我们会尽快处理。"
                />
            </a>
            <figcaption className="gallery-caption" itemprop="caption description">SUNYLIVE</figcaption>
        </figure>
    </>
}