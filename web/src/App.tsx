import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ExportPage from './pages/ExportPage';
import FeaturesPage from './pages/FeaturesPage';
import HowToPage from './pages/HowToPage';
import GettingStartedPage from './pages/GettingStartedPage';
import './index.css';

export default function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Navbar />
                <Routes>
                    <Route path="/" element={<ExportPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/how-to" element={<HowToPage />} />
                    <Route path="/getting-started" element={<GettingStartedPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
