// import PhotoSwipeLightbox from 'photoswipe/lightbox';
import React, { useReducer, createContext } from 'react'
import 'photoswipe/style.css';
import './App.css';

import Navigation from './navigation';
import Gallery from './gallery';
import { defaultState, reducer } from './reducer'

//可以抽离出去
export const Ctx = createContext()

function App() {
  const [state, dispatch] = useReducer(reducer, defaultState)
  return (
    <>
      <Ctx.Provider value={{ state, dispatch }}>
        <section className="navigationContainer">
          <Navigation />
        </section>
        <section className="galleryContainer">
          <Gallery />
        </section>
      </Ctx.Provider>
    </>
  );
}

export default App;
