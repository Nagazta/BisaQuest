// pages/ResourceLoadingScreen.jsx
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResourceLoader } from "../context/ResourceLoaderContext";
import useGlobalPreloader from "../hooks/useGlobalPreloader";
import AssetManifest from "../services/AssetManifest";
import "./ResourceLoadingScreen.css";

const TIPS = [
    "Pagkat-on og Cebuano samtang naglakaw sa kalibutan...",
    "Bisitaha ang Baryo ug tabangan si Ligaya...",
    "Ang Kagubatan nagtago og daghang mga sekreto...",
    "Ang Kastilyo ni Hara nagahulat sa inyong pag-abot...",
    "Basaha, Tun-i, Daoga — ang imong pakigsugal nagsugod na!",
    "Pag-amping sa mga misteryo sa kagubatan...",
    "Ang matinud-anon nga magtutuon makaabot sa Trono...",
    "Sakay na, ang adventure nagsugod!",
];

export default function ResourceLoadingScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { markLoaded } = useResourceLoader();
    const { progress, currentAsset, done } = useGlobalPreloader();

    const redirectTo = location.state?.redirectTo ?? "/student/characterSelection";

    const tipIndex = useRef(0);
    const tipEl = useRef(null);

    // Cycle tips every 3s
    useEffect(() => {
        const id = setInterval(() => {
            tipIndex.current = (tipIndex.current + 1) % TIPS.length;
            if (tipEl.current) {
                tipEl.current.classList.remove("rls-tip--visible");
                setTimeout(() => {
                    if (tipEl.current) {
                        tipEl.current.textContent = TIPS[tipIndex.current];
                        tipEl.current.classList.add("rls-tip--visible");
                    }
                }, 400);
            }
        }, 3000);
        return () => clearInterval(id);
    }, []);

    // Navigate when done
    useEffect(() => {
        if (done) {
            const t = setTimeout(() => {
                markLoaded();
                navigate(redirectTo);
            }, 800);
            return () => clearTimeout(t);
        }
    }, [done, navigate, markLoaded, redirectTo]);

    // SVG circle math
    const radius = 170;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="rls-root">

            {/* SVG gradient definition */}
            <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="#c8922a" />
                        <stop offset="50%"  stopColor="#f5c842" />
                        <stop offset="100%" stopColor="#f5a252" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Center ring */}
            <div className="rls-ring-wrapper">
                <svg className="rls-ring-svg" viewBox="0 0 420 420">
                    {/* Decorative outer ring */}
                    <circle
                        cx="210" cy="210" r="200"
                        className="rls-ring-deco"
                    />
                    {/* Track */}
                    <circle
                        cx="210" cy="210" r={radius}
                        className="rls-ring-track"
                    />
                    {/* Fill */}
                    <circle
                        cx="210" cy="210" r={radius}
                        className="rls-ring-fill"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 210 210)"
                    />
                </svg>

                {/* Character inside ring */}
                <div className="rls-ring-inner">
                    <img
                        className="rls-character"
                        src={AssetManifest.ui.loadingBoy}
                        alt="Loading character"
                    />
                    <span className="rls-pct">{progress}%</span>
                </div>
            </div>

            {/* Loading label */}
            <p className="rls-loading-label">
                {done ? "ANDAM NA!" : "LOADING..."}
            </p>

            {/* Tip ribbon */}
            <div className="rls-tip-ribbon">
                <p ref={tipEl} className="rls-tip rls-tip--visible">
                    {TIPS[0]}
                </p>
            </div>
        </div>
    );
}
