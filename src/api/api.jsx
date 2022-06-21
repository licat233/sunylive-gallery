import axios from 'axios';

function showError(msg) {
    if (msg === "Request aborted") return; //被终止的请求，不必报错提示
    const alertMsg = new window.AlertClass();
    alertMsg.show({
        title: '加载错误，请刷新网页或者稍后重试!!',
        content: msg,
        onHide: function () {
            // showError(msg);
        }
    })
}

function baseUrl() {
    const nowHost = window.location.host
    if (!nowHost) return "https://pic.sunylive.cn";
    const index = nowHost.search(":");
    if (index === -1) {
        return "";
    }
    return "https://pic.sunylive.cn";
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

export async function requestImgs(req) {
    if (!Array.isArray(req.ids)) throw new Error("req.ids不是数组");
    const url = baseUrl() + "/api/v1/share/imgs";
    const data = {
        ids: req.ids
    }
    try {
        const resp = await axios(url, { method: "post", data });
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

export async function authPhoneNumber(req) {
    const url = baseUrl() + "/api/v1/share/albums";
    try {
        const resp = await axios.post(url, { phone_number: req.phone_number });
        if (resp.status === 200) {
            if (resp.data.status) {
                console.log("验证通过")
            }
        }
        throw new Error("加载相册失败，请稍后再重试！")
    } catch (error) {
        showError(error.message)
        return []
    }
}