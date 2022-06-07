import axios from 'axios';

function showError(msg) {
    const alertMsg = new window.AlertClass();
    alertMsg.show({
        title: '加载错误，请刷新网页或者稍后重试!!',
        content: msg,
        onHide: function () {
            showError(msg);
        }
    })
}

function baseUrl() {
    const nowHost = window.location.host
    if (!nowHost) return "https://www.sunylive.cc";
    const index = nowHost.search(":");
    if (index === -1) {
        return "";
    }
    return "https://www.sunylive.cc";
}

//返回一个数组
export async function requestAlbums() {
    const url = baseUrl() + "/api/v1/share/albums";
    try {
        const resp = await axios(url);
        if (resp.status === 200) {
            if (resp.data.status) {
                const albums = resp.data.data.data
                if (Array.isArray(albums)) {
                    return albums;
                }
            }
        }
        throw new Error("加载相册失败，请稍后再重试！")
    } catch (error) {
        showError(error.message)
        return []
    }
}

//返回一个对象
export async function requestImages(req) {
    const url = baseUrl() + "/api/v1/share/images";
    const params = {
        page: req.page || 1,
        order: req.order || "earliest",
        permission: req.permission || "public",
        album_id: req.album_id || 4
    }
    try {
        const resp = await axios(url, { params });
        if (resp.status === 200) {
            // console.log(resp)
            if (resp.data.status) {
                const images = resp.data.data.images;
                if (images) return images;
            }
        }
        throw new Error("加载图片失败，请稍后再重试！")
    } catch (error) {
        showError(error.message)
        return {
            data: []
        }
    }
}
