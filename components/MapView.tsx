

import React, { useState, useEffect, useMemo } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Ad } from '../types';

interface MapViewProps {
  ads: Ad[];
  onSelectAd: (ad: Ad) => void;
}

interface AdMarkerProps {
    ad: Ad;
    onClick: () => void;
}

const AdMarker: React.FC<AdMarkerProps> = ({ ad, onClick }) => {
    return (
        <AdvancedMarker position={{ lat: ad.lat!, lng: ad.lng! }} onClick={onClick}>
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm border-2 border-white dark:border-slate-900 shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <span>₹{Math.round(ad.reward)}</span>
            </div>
        </AdvancedMarker>
    );
};

const AdInfoWindow = ({ ad, onClose, onSelectAd }: { ad: Ad; onClose: () => void, onSelectAd: (ad: Ad) => void }) => {
    return (
        <InfoWindow position={{ lat: ad.lat!, lng: ad.lng! }} onCloseClick={onClose}>
            <div className="w-48">
                <img src={ad.thumbnailUrl} alt={ad.title} className="w-full h-24 object-cover rounded-t-lg" />
                <div className="p-2">
                    <h3 className="font-bold text-sm text-slate-800 truncate">{ad.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">Reward: ₹{ad.reward.toFixed(2)}</p>
                    <button onClick={() => onSelectAd(ad)} className="w-full py-1.5 px-3 bg-indigo-600 text-white font-semibold text-xs rounded-md hover:bg-indigo-500 transition-colors">
                        View Details
                    </button>
                </div>
            </div>
        </InfoWindow>
    );
};

const MapBounds = ({ ads }: { ads: Ad[] }) => {
    const map = useMap();
    const mapsLib = useMapsLibrary('maps');
    const adPositions = useMemo(() => ads.filter(ad => ad.lat && ad.lng).map(ad => ({ lat: ad.lat!, lng: ad.lng! })), [ads]);
    
    useEffect(() => {
        if (map && mapsLib && adPositions.length > 0) {
            const bounds = new mapsLib.LatLngBounds();
            adPositions.forEach(pos => bounds.extend(pos));
            map.fitBounds(bounds, 100); // 100px padding
        }
    }, [map, mapsLib, adPositions]);

    return null;
}

const MapView: React.FC<MapViewProps> = ({ ads, onSelectAd }) => {
  const [openAdId, setOpenAdId] = useState<string | null>(null);
  
  const adsWithLocation = ads.filter(ad => ad.lat && ad.lng);

  return (
    <div className="w-full h-[65vh] bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
        <Map
          defaultCenter={{ lat: 20.5937, lng: 78.9629 }} // Center of India
          defaultZoom={4}
          mapId="ad-master-map"
          disableDefaultUI={true}
          gestureHandling="greedy"
        >
          {adsWithLocation.map(ad => (
            <AdMarker key={ad.id} ad={ad} onClick={() => setOpenAdId(ad.id)} />
          ))}

          {openAdId && (
            <AdInfoWindow
              ad={adsWithLocation.find(ad => ad.id === openAdId)!}
              onClose={() => setOpenAdId(null)}
              onSelectAd={onSelectAd}
            />
          )}

          <MapBounds ads={adsWithLocation} />

        </Map>
    </div>
  );
};

export default MapView;