import { Routes, Route } from 'react-router-dom';
import MintNft from './pages/MintNft.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import BrandingKit from './pages/BrandingKit.jsx';
import './App.css';
import HomePage from './pages/HomePage.jsx';



function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/mint-nft" element={<MintNft />} /> */}
        <Route path="/brand-kit" element={<BrandingKit />} />
        <Route path="/TOS" element={<TermsOfService />} />
        <Route path="/PP" element={<PrivacyPolicy />} />
      </Routes>
    </div>
  );
}

export default App;
