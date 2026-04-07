import { Map as MapIcon, Navigation } from 'lucide-react';

const MapPlaceholder = ({ services }) => {
    return (
        <div className="w-full h-full bg-[#f8fafc] relative flex items-center justify-center overflow-hidden group">
            {/* Map simulated background pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-1000 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83v58.34h-58.34v-.83l57.51-58.34zM53.797 0h-53.797v53.797l53.797-53.797zM20 0v20h-20v-20h20zm0 40v20h-20v-20h20zm20-40v20h-20v-20h20zm20 40v20h-20v-20h20zm0-20v20h-20v-20h20z' fill='%230f172a' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Abstract Map Roads */}
            <div className="absolute top-[30%] left-0 right-0 h-4 bg-gray-200/50 -rotate-6 transform origin-left"></div>
            <div className="absolute top-0 bottom-0 left-[40%] w-4 bg-gray-200/50 rotate-12 transform origin-top"></div>

            {/* Interactive elements simulation */}
            <div className="absolute inset-0 p-8">
                {services.map((service, idx) => (
                    <div
                        key={service.id}
                        className={`absolute flex flex-col items-center animate-in zoom-in duration-700`}
                        style={{
                            top: `${15 + (idx * 30)}%`,
                            left: `${20 + (idx * 25 * (idx % 2 === 0 ? 1 : -1))}%`,
                            animationDelay: `${idx * 150}ms`
                        }}
                    >
                        <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-lg font-bold text-xs mb-2 text-gray-800 whitespace-nowrap hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {service.waitTime} min wait
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-4 border-white cursor-pointer hover:scale-110 transition-transform ${service.status === 'Low' ? 'bg-semantic-green shadow-semantic-green/30' :
                                service.status === 'Medium' ? 'bg-semantic-yellow shadow-semantic-yellow/30' : 'bg-semantic-red shadow-semantic-red/30'
                            }`}>
                            <Navigation className="w-4 h-4 text-white fill-current" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-gray-200/50 border border-white/50 max-w-sm text-center mx-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg shadow-primary-500/30 transform -rotate-6">
                    <MapIcon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Live Crowd Map</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">Experience real-time crowd heatmaps. View fast-moving queues and avoid congested areas with our interactive AI-driven map.</p>
                <button className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 shadow-xl shadow-gray-900/20 transition-all active:scale-95">
                    Explore Heatmap Integration
                </button>
            </div>

            {/* Map Controls */}
            <div className="absolute right-6 bottom-6 flex flex-col gap-3">
                <button className="w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors border border-white">
                    <span className="text-2xl font-light leading-none">+</span>
                </button>
                <button className="w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors border border-white">
                    <span className="text-2xl font-light leading-none">-</span>
                </button>
            </div>
        </div>
    );
};

export default MapPlaceholder;
