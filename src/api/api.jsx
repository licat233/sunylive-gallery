import axios from 'axios';

export async function requestAlbums() {
    const url = "https://img.catli.net/api/v1/share/albums";
    const { data: { data: { data } } } = await axios(url);
    return data;
}

export async function requestImages(req) {
    const url = "https://img.catli.net/api/v1/share/images";
    const params = {
        page: req.page || 1,
        order: req.order || "earliest",
        permission: req.permission || "public",
        album_id: req.album_id || 4
    }
    const { data: { data: { images } } } = await axios(url, {
        params
    });
    return images;
}