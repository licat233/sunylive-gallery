import { useEffect } from 'react';
import "./footer.css";
import $ from 'jquery.scrollto';
import wechat1 from "../images/wechat1.jpg";
import wechat2 from "../images/wechat2.jpg";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export default function Footer() {

    const onTips = () => {
        const targets = document.querySelectorAll("[data-tips]")
        tippy(targets, {
            // default
            content: '暂未开放',
            trigger: 'click',
            placement: 'right',
            arrow: true,
            animation: 'fade',
            theme: 'light',
        });
    }

    const Contact = () => {
        const alertMsg = new window.AlertClass();
        alertMsg.show({
            title: '联系电话',
            content: '400-0318-793 <br/> 020-87407821',
        })
    }

    const toScrollTop = () => {
        $(window).scrollTo(0, {
            axis: 'y',
            duration: 400
        });
    }

    useEffect(() => {
        onTips()
        return () => {
            // cleanup
        };
    }, []);

    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-item">
                    <h6>关于/About</h6>
                    <p className="text-about">上宜居 <i> sunylive </i> 是一家专业设计定制生产意大利轻奢极简风格家具的高端全屋定制品牌，主要生产衣柜、护墙板、展柜、书柜、木门、玄关柜等家具，专注家居制造业12年，擅长将不锈钢与面板完美结合打造出优质家居产品，提供全屋定制、家具定做、预约量尺定制服务！</p>
                </div>

                <div className="footer-item">
                    <h6>商城/Mall</h6>
                    <ul className="footer-links">
                        <li><a href="https://shop352785864.taobao.com" target="_blank" rel="noreferrer">官方宝店铺</a></li>
                        <li><a href="https://sf178178.1688.com" target="_blank" rel="noreferrer">官方1688店铺</a></li>
                        <li><span data-tips target="_blank" rel="noreferrer">官方抖音店铺</span></li>
                        <li><span data-tips target="_blank" rel="noreferrer">官方小红书店铺</span></li>
                        <li><span data-tips target="_blank" rel="noreferrer">官方小程序商城</span></li>
                        <li><span data-tips target="_blank" rel="noreferrer">官方网上商城</span></li>
                    </ul>
                </div>

                <div className="footer-item">
                    <h6>关注我们</h6>
                    <ul className="social-icons">
                        <li><a className="wechat" href="wechat://" target="_blank" rel="noreferrer"><img alt="add wechat" className="lazyload" data-src={wechat1} width="100" height="100" src="data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http://www.w3.org/2000/svg'%20viewBox%3D'0%200%201000%20500'%20%2F%3E" /></a></li>
                        <li><a className="wechat" href="wechat://" target="_blank" rel="noreferrer"><img alt="add wechat" className="lazyload" data-src={wechat2} width="100" height="100" src="data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http://www.w3.org/2000/svg'%20viewBox%3D'0%200%201000%20500'%20%2F%3E" /></a></li>
                    </ul>
                </div>

                <div className="footer-item">
                    <h6>相关链接</h6>
                    <ul className="footer-links">
                        <li><span data-tips target="_blank" rel="noreferrer">sunylive官网</span></li>
                        <li><span onClick={Contact} target="_blank" rel="noreferrer">联系我们</span></li>
                        <li><a href="/vip" target="_self" rel="noreferrer">会员入口</a></li>
                        <li><span onClick={toScrollTop}>⬆TOP</span></li>
                    </ul>
                </div>
            </div>
            <br />
            <hr />
            <div className="copyright">
                <p>本网站部分图片源于网络,若发现您的权利被侵害,请联系我们尽快处理，联系邮箱：licat233@gmail.com</p>
                <p className="copyright-text">Copyright &copy; 2022 All Rights Reserved by SUNYLIVE-GALLERY.
                    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">粤ICP备2022069223号-1</a>.
                </p>
            </div>
        </footer>
    )
}