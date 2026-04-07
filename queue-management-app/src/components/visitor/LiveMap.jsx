import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, MapPin, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Fix for default Leaflet marker icons
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const TILE_URLS = {
    light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
};

// Premium custom markers with pulse ring
const createCustomIcon = (colorHex) => {
    return L.divIcon({
        className: "custom-pin",
        iconAnchor: [14, 14],
        popupAnchor: [0, -18],
        html: `
            <div style="position:relative;width:28px;height:28px;">
                <div style="
                    position:absolute;inset:0;
                    background:${colorHex};
                    border-radius:50%;
                    opacity:0.2;
                    animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;
                "></div>
                <div style="
                    position:absolute;inset:4px;
                    background:${colorHex};
                    border-radius:50%;
                    border:2.5px solid white;
                    box-shadow:0 2px 8px ${colorHex}88;
                "></div>
            </div>
        `
    });
};

const iconGreen = createCustomIcon('#10b981');
const iconYellow = createCustomIcon('#f59e0b');
const iconRed = createCustomIcon('#ef4444');

const getMarkerIcon = (status) => {
    switch (status) {
        case 'Low': return iconGreen;
        case 'Medium': return iconYellow;
        case 'High': return iconRed;
        default: return new L.Icon.Default();
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Low': return '#10b981';
        case 'Medium': return '#f59e0b';
        case 'High': return '#ef4444';
        default: return '#94a3b8';
    }
};

// Fit bounds
const MapBounds = ({ services }) => {
    const map = useMap();
    useEffect(() => {
        if (services && services.length > 0) {
            const validServices = services.filter(s => s.geo && s.geo.length === 2 && !isNaN(s.geo[0]) && !isNaN(s.geo[1]));
            if (validServices.length > 0) {
                const bounds = L.latLngBounds(validServices.map(s => s.geo));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [services, map]);
    return null;
};

const LiveMap = ({ services, onMarkerClick }) => {
    const { isDark } = useTheme();
    const center = services.length > 0 && services[0].geo ? services[0].geo : [23.7104, 90.4074];

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', baseZIndex: 0 }}
                className="z-0 relative"
            >
                <TileLayer
                    key={isDark ? 'dark' : 'light'}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={isDark ? TILE_URLS.dark : TILE_URLS.light}
                />
                <MapBounds services={services} />

                {services.map((service) => (
                    <Marker
                        key={service.id}
                        position={service.geo}
                        icon={getMarkerIcon(service.status)}
                        eventHandlers={{
                            click: () => onMarkerClick && onMarkerClick(service)
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1 min-w-[180px]">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 text-sm leading-tight">{service.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">{service.type}</p>
                                    </div>
                                    <span
                                        className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white"
                                        style={{ backgroundColor: getStatusColor(service.status) }}
                                    >
                                        {service.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1 font-bold text-gray-700">
                                        <Clock className="w-3 h-3 text-primary-500" />
                                        {service.waitTime}m
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <MapPin className="w-3 h-3" />
                                        {service.distance}
                                    </div>
                                </div>
                                <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${Math.min((service.waitTime / 60) * 100, 100)}%`,
                                            backgroundColor: getStatusColor(service.status)
                                        }}
                                    />
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map overlay stats */}
            <div className="absolute top-4 left-4 z-[1000] flex gap-2 pointer-events-none">
                <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-white/50 dark:border-dark-border flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary-500" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{services.length} locations</span>
                </div>
            </div>
        </div>
    );
};

export default LiveMap;
