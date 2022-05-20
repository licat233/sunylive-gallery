
//需要共享的数据：current_album_id
const defaultState = {
    current_album_id: 4
}

const reducer = (state = defaultState, action) => {
    console.log(action);
    return state
}

export {
    defaultState, reducer
}

