import './css/App.css';
import Gallery from './gallery';
import './css/other.css';
import './css/star.css';
import Footer from './footer/footer';

function App() {
  return (
    <>
      <Gallery />
      <Footer />
      <div className="star-background">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>
    </>
  );
}

export default App;