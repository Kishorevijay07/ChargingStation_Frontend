import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useQuery } from '@tanstack/react-query';
import { baseUrl } from '../../urls/constant'; // adjust path as needed
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Fit map to bounds of all markers
const FitBounds = ({ chargers }) => {
  const map = useMap();

  useEffect(() => {
    if (chargers.length > 0) {
      const bounds = chargers.map(station =>
        [station.location.latitude, station.location.longitude]
      );
      map.fitBounds(bounds);
    }
  }, [chargers, map]);

  return null;
};

const RightSidebar = () => {
  const navigate = useNavigate();

  const fetchChargers = async () => {
    const res = await fetch(`${baseUrl}/api/stations/all`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch chargers');
    return res.json();
  };

  const { data: chargers = [], isLoading, isError, error } = useQuery({
    queryKey: ['chargers'],
    queryFn: fetchChargers,
  });

   
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!res.ok) {
        throw new Error('Logout failed');
      }
      return true;
    },
    onSuccess: () => {
      // Immediately clear cached authUser data
      queryClient.setQueryData(['authUser'], null);
      // Navigate to login
      navigate('/login');
    },
    onError: (error) => {
      console.error(error);
      alert('Logout failed');
    }
  })

  if (isLoading) return <p>Loading map...</p>;
  if (isError) return <p>Error loading chargers: {error.message}</p>;

  return (
    <div className="w-full h-full relative">
      {/* Logout Button */}
      <button
        onClick={()=>logoutMutation.mutate()}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded z-[1000]"
      >
        Logout
      </button>

      <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds chargers={chargers} />

        {chargers.map((station) => (
          <Marker
            key={station._id}
            position={[station.location.latitude, station.location.longitude]}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              {station.name}
            </Tooltip>
            <Popup>
              <strong>{station.name}</strong><br />
              Status: {station.status}<br />
              Power: {station.powerOutput} kW<br />
              Connector: {station.connectorType}<br />
              Lat/Lng: {station.location.latitude}, {station.location.longitude}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RightSidebar;
