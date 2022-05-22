// import { useRef } from 'react';
import "./footer.css";
import wechat1 from "../images/wechat1.jpg";
import wechat2 from "../images/wechat2.jpg";

export default function Footer() {
    // const envelope = useRef(null);
    // const disclaims = useRef(null);
    // const disclaimsBox = useRef(null);

    // const showDisclaims = () => {
    //     disclaims.current.classList.add("animate__bounceInUp");
    //     disclaimsBox.current.style.display = 'block';
    //     disclaims.current.style.display = 'block';
    //     setTimeout(()=>{
    //         envelope.current.classList.add("open");
    //     },1000)
    //     // setTimeout(() => {
    //     //     disclaims.current.classList.remove("animate__bounceInUp");
    //     // }, 3000)
    // }
    // const closeDisclaims = () => {
    //     envelope.current.classList.remove("open");
    //     disclaims.current.classList.remove("animate__bounceInUp");
    //     disclaims.current.classList.add("animate__backOutDown");
    //     setTimeout(() => {
    //         disclaimsBox.current.style.display = 'none';
    //         disclaims.current.style.display = 'none';
    //         disclaims.current.classList.remove("animate__backOutDown");
    //     }, 1000)
    // }
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-item">
                    <h6>关于/About</h6>
                    <p className="text-justify">上宜居 <i> sunylive </i> 是一家专业设计定制生产意大利轻奢极简风格家具的高端全屋定制品牌，主要生产衣柜、护墙板、展柜、书柜、木门、玄关柜等家具，专注家居制造业12年，擅长将不锈钢与面板完美结合打造出优质家居产品。上宜居全屋定制官网，提供家具定做、预约量尺定制服务！</p>
                </div>

                <div className="footer-item">
                    <h6>商城/Mall</h6>
                    <ul className="footer-links">
                        <li><a href="about:blank" target="_blank" rel="noreferrer">官方宝店铺</a></li>
                        <li><a href="about:blank" target="_blank" rel="noreferrer">官方1688店铺</a></li>
                        <li><a href="about:blank" target="_blank" rel="noreferrer">官方抖音店铺</a></li>
                        <li><a href="about:blank" target="_blank" rel="noreferrer">官方小红书店铺</a></li>
                        <li><a href="about:blank" target="_blank" rel="noreferrer">官方小程序商城</a></li>
                        <li><a href="about:blank" target="_blank" rel="noreferrer">官方网上商城</a></li>
                    </ul>
                </div>

                <div className="footer-item">
                    <h6>相关链接</h6>
                    <ul className="footer-links">
                        <li><a href="about:blank" target="_blank" rel="noreferrer">sunylive官网</a></li>
                        <li><a href="about:blank" target="_blank" rel="noreferrer">Contact Us</a></li>
                        {/* <li><span onClick={showDisclaims}>站点声明</span></li> */}
                    </ul>
                </div>
                <div className="footer-item">
                    <h6>关注我们</h6>
                    <ul className="social-icons">
                        <li><a className="wechat" href="wechat://" target="_blank" rel="noreferrer"><img alt="wechat" src={wechat1} /></a></li>
                        <li><a className="wechat" href="wechat://" target="_blank" rel="noreferrer"><img alt="wechat" src={wechat2} /></a></li>
                    </ul>
                </div>
            </div>
            {/* <div className="disclaims-box" ref={disclaimsBox} onClick={closeDisclaims}>
                <div id="disclaims" ref={disclaims}>
                    <div className="envelope open" ref={envelope}>
                        <div className="flap front"></div>
                        <div className="flap top"></div>
                        <div className="letter"></div>
                    </div>
                </div>
            </div> */}
            <br />
            <hr />
            <div className="copyright">
                <p>本网站部分图片源于网络,若发现您的权利被侵害,请联系我们尽快处理，投诉邮箱：licat233@gmail.com</p>
                <p className="copyright-text">Copyright &copy; 2022 All Rights Reserved by sunylive.
                    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">黔ICP备20005208号-2</a>.
                </p>
            </div>
        </footer>
    )
}