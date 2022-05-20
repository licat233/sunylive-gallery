import axios from 'axios';

export default async function requestAlbums() {
    const url = "https://img.catli.net/api/v1/share/albums";
    const { data: { data: { data } } } = await axios(url);
    return data;
}

export async function requestImages() {
    const url = "https://img.catli.net/api/v1/share/images";
    const { data: { data: { data } } } = await axios(url);
    return data;
}