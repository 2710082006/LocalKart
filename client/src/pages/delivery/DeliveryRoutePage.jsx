import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Phone, ArrowLeft, Clock } from 'lucide-react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { orderAPI } from '../../api';

export default function DeliveryRoutePage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['orderRoute', id],
    queryFn: () => orderAPI.getById(id).then((r) => r.data),
  });

  const order = data?.data;

  const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
  });

  if (isLoading || !isLoaded) {
    return (
      <div className="p-8">
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-neutral-500">
        Order not found
      </div>
    );
  }

  // Correct backend schema
  const destCoords = order.deliveryAddress?.location?.coordinates;
  const partnerCoords = order.deliveryAgent?.currentLocation?.coordinates;

  // GeoJSON format: [lng, lat]
  const destination =
    destCoords?.length === 2
      ? {
          lat: destCoords[1],
          lng: destCoords[0],
        }
      : null;

  const currentLocation =
    partnerCoords?.length === 2
      ? {
          lat: partnerCoords[1],
          lng: partnerCoords[0],
        }
      : null;

  const mapCenter = currentLocation || destination;

  if (!destination) {
    return (
      <div className="p-8 text-center text-neutral-500">
        Location unavailable
      </div>
    );
  }

  return (
    <div
      id="delivery-route"
      className="flex flex-col h-[calc(100vh-80px)] -m-6 sm:-m-8"
    >
      {/* Header */}
      <div className="bg-white p-4 border-b border-neutral-100 flex items-center gap-4 z-10 shrink-0">
        <Link
          to="/delivery/assigned"
          className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center hover:bg-neutral-100"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Link>

        <div>
          <h1 className="text-lg font-bold text-neutral-900">Route Map</h1>
          <p className="text-xs text-neutral-500">
            Order #{order.orderNumber}
          </p>
        </div>

        <Link
          to={`/delivery/status/${order._id}`}
          className="ml-auto btn-primary !py-2 !text-sm"
        >
          Update Status
        </Link>
      </div>

      {/* Interactive Google Map */}
      <div className="flex-1 relative overflow-hidden">
        <GoogleMap
          mapContainerStyle={{
            width: '100%',
            height: '100%',
          }}
          center={mapCenter}
          zoom={13}
        >
          {/* Delivery Agent Marker */}
          {currentLocation && <Marker position={currentLocation} />}

          {/* Customer Marker */}
          <Marker position={destination} />
        </GoogleMap>

        {/* Floating Route Info */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-6 left-6 right-6 md:left-auto md:w-96 bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <Clock className="w-5 h-5" /> 18 min
              </div>
              <span className="text-sm text-neutral-500">4.2 km</span>
            </div>

            <div className="space-y-4">
              {/* Current Location */}
              <div className="flex gap-3 relative">
                <div className="absolute left-2.5 top-6 bottom-[-16px] w-0.5 bg-neutral-200" />
                <MapPin className="w-5 h-5 text-neutral-400 shrink-0 z-10 bg-white" />
                <div className="-mt-1">
                  <p className="text-xs font-semibold text-neutral-500">
                    CURRENT LOCATION
                  </p>
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {currentLocation
                      ? `${currentLocation.lat}, ${currentLocation.lng}`
                      : 'Live location unavailable'}
                  </p>
                </div>
              </div>

              {/* Destination */}
              <div className="flex gap-3">
                <Navigation className="w-5 h-5 text-sky-500 shrink-0 z-10 bg-white" />
                <div className="-mt-1">
                  <p className="text-xs font-semibold text-sky-600">
                    DESTINATION
                  </p>
                  <p className="text-sm font-medium text-neutral-900 line-clamp-2">
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-neutral-50 p-4 border-t border-neutral-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                {order.customerId?.name?.charAt(0) || 'C'}
              </div>

              <div>
                <p className="text-sm font-bold text-neutral-900">
                  {order.customerId?.name || 'Customer'}
                </p>
                <p className="text-xs text-neutral-500">
                  Waiting for delivery
                </p>
              </div>
            </div>

            <a
              href={`tel:${order.deliveryAddress?.phone || order.customerId?.phone}`}
              className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-sky-600 hover:bg-sky-50 transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}