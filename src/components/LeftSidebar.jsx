import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { baseUrl } from '../../urls/constant';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerImage from './../images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Set Leaflet default marker icon
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerImage,
  iconUrl: markerImage,
  shadowUrl: markerShadow,
});

const fetchChargers = async () => {
  const res = await fetch(`${baseUrl}/api/stations/all`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch chargers');
  return res.json();
};

const LocationPicker = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLocation({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
    },
  });
  return null;
};

const ChargerList = ({ authUser }) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', connectorType: '', powerOutput: '' });
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    powerOutput: '',
    connectorType: '',
    location: { latitude: '', longitude: '' },
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: chargers = [], isLoading, isError, error } = useQuery({
    queryKey: ['chargers'],
    queryFn: fetchChargers,
  });

  const addCharger = useMutation({
    mutationFn: async (newCharger) => {
      const res = await fetch(`${baseUrl}/api/stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCharger),
      });
      if (!res.ok) throw new Error('Failed to add charger');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chargers'] });
      resetForm();
    },
  });

  const updateCharger = useMutation({
    mutationFn: async (updated) => {
      
      const res = await fetch(`${baseUrl}/api/stations/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Failed to update charger');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chargers'] });
      resetForm();
    },
  });

  const deleteCharger = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${baseUrl}/api/stations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete charger');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chargers'] });
    },
  });

  const filteredChargers = chargers.filter((ch) =>
    (!filters.status || ch.status === filters.status) &&
    (!filters.connectorType || ch.connectorType === filters.connectorType) &&
    (!filters.powerOutput || ch.powerOutput.toString() === filters.powerOutput)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateCharger.mutate(formData);
    } else {
      addCharger.mutate({ ...formData, user: authUser._id });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      status: '',
      powerOutput: '',
      connectorType: '',
      location: { latitude: '', longitude: '' },
    });
    setShowModal(false);
  };

  const openNewStationModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="p-4 flex justify-between items-center border-b bg-white sticky top-0 z-10">
        <h2 className="text-xl font-semibold">Charger Stations</h2>
        <button
          onClick={openNewStationModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Station
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-64px)]">
        <div className="flex gap-2">
          <select
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="border p-1"
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            onChange={(e) => setFilters((f) => ({ ...f, connectorType: e.target.value }))}
            className="border p-1"
          >
            <option value="">Connector</option>
            <option value="Type A">Type A</option>
            <option value="Type B">Type B</option>
            <option value="Micro-B">Micro-B</option>
            <option value="Mini-B">Mini-B</option>
          </select>

          <input
            type="text"
            placeholder="Power (kW)"
            className="border p-1 w-24"
            onChange={(e) => setFilters((f) => ({ ...f, powerOutput: e.target.value }))}
          />
        </div>

        {isLoading && <p>Loading...</p>}
        {isError && <p className="text-red-500">Error: {error.message}</p>}

        <ul>
          {filteredChargers.map((ch) => (
            <li key={ch._id} className="mb-3 border p-3 rounded bg-white shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{ch.name}</h3>
                  <p>Status: {ch.status}</p>
                  <p>Power: {ch.powerOutput} kW</p>
                  <p>Connector: {ch.connectorType}</p>
                  <p>Lat/Lng: {ch.location?.latitude}, {ch.location?.longitude}</p>
                </div>

                {ch.user === authUser?._id && (
                  <div className="flex gap-2 items-center">
                    <p className="text-xs text-gray-500">(Created By You)</p>
                    <button
                      onClick={() => {
                        setEditingId(ch._id);
                        setFormData({
                          name: ch.name,
                          status: ch.status,
                          powerOutput: ch.powerOutput,
                          connectorType: ch.connectorType,
                          location: {
                            latitude: ch.location?.latitude || '',
                            longitude: ch.location?.longitude || '',
                          },
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteCharger.mutate(ch._id)}
                      className="text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-lg w-[80%] max-w-sm space-y-3">
            <h3 className="text-lg font-semibold">{editingId ? 'Edit Charger' : 'Add New Charger'}</h3>

            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              className="w-full border p-2 rounded"
              required
            />

            <select
              value={formData.status}
              onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <input
              type="number"
              placeholder="Power Output (kW)"
              value={formData.powerOutput}
              onChange={(e) => setFormData((f) => ({ ...f, powerOutput: e.target.value }))}
              className="w-full border p-2 rounded"
              required
            />

            <div className="h-48">
              <MapContainer
                center={[
                  formData.location.latitude || 20,
                  formData.location.longitude || 0,
                ]}
                zoom={formData.location.latitude ? 13 : 2}
                scrollWheelZoom={true}
                className="h-full w-full rounded"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker setLocation={(loc) => setFormData((f) => ({ ...f, location: loc }))} />
                {formData.location.latitude && formData.location.longitude && (
                  <Marker position={[formData.location.latitude, formData.location.longitude]} />
                )}
              </MapContainer>
            </div>

            <div className="flex gap-2 mt-2">
              <input
                type="number"
                placeholder="Latitude"
                className="w-1/2 border p-2 rounded"
                value={formData.location.latitude}
                onChange={(e) => setFormData((f) => ({
                  ...f,
                  location: { ...f.location, latitude: e.target.value },
                }))}
              />
              <input
                type="number"
                placeholder="Longitude"
                className="w-1/2 border p-2 rounded"
                value={formData.location.longitude}
                onChange={(e) => setFormData((f) => ({
                  ...f,
                  location: { ...f.location, longitude: e.target.value },
                }))}
              />
            </div>

            <select
              value={formData.connectorType}
              onChange={(e) => setFormData((f) => ({ ...f, connectorType: e.target.value }))}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Connector Type</option>
              <option value="Type A">Type A</option>
              <option value="Type B">Type B</option>
              <option value="Micro-B">Micro-B</option>
              <option value="Mini-B">Mini-B</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                {editingId ? 'Update' : 'Add'} Charger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChargerList;