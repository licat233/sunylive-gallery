import { useState } from "react";
import axios from 'axios';

export default function Gallery(props) {
    const [images,setImages] = useState([]);
    const requestImages = () => {
        const url = "https://img.catli.net/api/v1/share/images";
        const result = await axios(url);
        const data = result.data.data;
        if (!Array.isArray(data)) return
        setImages(data);
    }
    return <>
        <div className="gallery" id="gallery" itemscope="" itemtype="http://schema.org/ImageGallery">
        </div>
    </>
}