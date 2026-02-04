import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Link } from "react-router-dom";
import { HashLoader } from "react-spinners"; // Import HashLoader

// Leaflet imports for map functionality
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- IMPORTANT: Fix for default marker icon not showing with Webpack ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// ----------------------------------------------------------------------

// Custom component to handle map centering on the user's location
function LocationMarker({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position.latitude && position.longitude) {
            map.flyTo([position.latitude, position.longitude], map.getZoom());
        }
    }, [position, map]);

    if (position.latitude && position.longitude) {
        return (
            <Marker position={[position.latitude, position.longitude]}>
                <Popup>Your Current Location</Popup>
            </Marker>
        );
    }
    return null;
}

// Add PropTypes validation for the LocationMarker component
LocationMarker.propTypes = {
    position: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
    }).isRequired,
};

export default function ContactUs() {
  const [loading, setLoading] = useState(true); // Add loading state
  const [result, setResult] = useState("");
  const [faqEmail, setFaqEmail] = useState("");
  const [faqMessage, setFaqMessage] = useState("");
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });
  // New state to hold the address string for the input field, including coordinates
  const [addressInput, setAddressInput] = useState("");

  const defaultMapCenter = [12.9716, 77.5946]; // Coordinates for Bengaluru, India (Zarvoc HQ)

  useEffect(() => {
    // Set a timeout to hide the loader after 2 seconds
    const timer = setTimeout(() => setLoading(false), 2000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({
            latitude,
            longitude,
            error: null,
          });
          // Update the address input field with the fetched coordinates
          setAddressInput(`Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setUserLocation((prev) => ({
            ...prev,
            error: "Unable to retrieve your location. Please enable location services and refresh.",
          }));
          // Fallback to default map center and clear address input
          setUserLocation((prev) => ({
              ...prev,
              latitude: defaultMapCenter[0],
              longitude: defaultMapCenter[1],
          }));
          setAddressInput(""); // Clear address input on error
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
      }));
      // Fallback to default map center and clear address input
      setUserLocation((prev) => ({
          ...prev,
          latitude: defaultMapCenter[0],
          longitude: defaultMapCenter[1],
      }));
      setAddressInput(""); // Clear address input if geolocation not supported
    }

    return () => clearTimeout(timer);
  }, []); // Run only once on mount

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending...");

    const formData = new FormData(event.target);
    formData.append("access_key", "0accc7d5-adab-43a4-a5b9-b90b7879c4dc");
    // Ensure the address field from state is used, not just the HTML input's initial value
    formData.set("address", addressInput);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult("Form Submitted Successfully ✅");
        event.target.reset(); // This resets the HTML form fields
        setAddressInput(""); // Manually clear the controlled address input
      } else {
        console.error("Error", data);
        setResult("Something went wrong ❌");
      }
    } catch (err) {
      console.error("Network or submission error:", err);
      setResult("Submission failed due to a network error.");
    }
  };

  const onFaqSubmit = async (e) => {
    e.preventDefault();
    setFaqMessage("Sending...");

    const formData = new FormData();
    formData.append("access_key", "0accc7d5-adab-43a4-a5b9-b90b7879c4dc");
    formData.append("email", faqEmail);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFaqMessage("Submitted ✅");
        setFaqEmail("");
      } else {
        console.error("Error", data);
        setFaqMessage("Submission failed ❌");
      }
    } catch (err) {
      console.error("Network or FAQ submission error:", err);
      setFaqMessage("Submission failed due to a network error.");
    }
  };

  // Show loader while loading is true
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        {/* HashLoader component with customizable color and size */}
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 text-gray-900 font-sans">
        {/* Contact Form Section */}
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-2">
              Email, call, or complete the form to learn how UrbanTales can solve your messaging problem.
            </p>
            <p className="text-sm text-gray-600">info@urbantales.com</p>
            <p className="text-sm text-gray-600 mb-2">921-231-221</p>
            <a href="/support" className="text-blue-600 underline text-sm">Customer Support</a>

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="font-semibold">Customer Support</h4>
                <p className="text-sm text-gray-600">
                  Our support team is available 24/7 to assist with technical or general questions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Feedback and Suggestions</h4>
                <p className="text-sm text-gray-600">
                  We appreciate feedback and ideas. Your input helps us shape the future of UrbanTales.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Media Inquiries</h4>
                <p className="text-sm text-gray-600">
                  For media-related questions or partnerships, reach out to media@urbantales.com
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="flex gap-4">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>
              <input
                type="text"
                name="address"
                placeholder={addressInput ? addressInput : "Enter your address or location will fill automatically"}
                value={addressInput} // Control the input with state
                onChange={(e) => setAddressInput(e.target.value)} // Allow user to edit if needed
                className="w-full border rounded-lg px-4 py-2"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                className="w-full border rounded-lg px-4 py-2"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                className="w-full border rounded-lg px-4 py-2"
              />
              <textarea
                name="message"
                placeholder="How can we help?"
                rows="4"
                className="w-full border rounded-lg px-4 py-2"
                required
              ></textarea>
              <button
                type="submit"
                className="bg-[#070A52] text-white px-4 py-2 rounded-lg w-full hover:bg-[#FFCC00]"
              >
                Submit
              </button>
              {result && (
                <p className="text-center text-sm text-green-600 mt-2">{result}</p>
              )}
              <p className="text-xs text-center text-gray-500">
                By contacting us, you agree to our{" "}
                <a className="underline" href="/terms-of-service">Terms of service</a> and{" "}
                <a className="underline" href="/privacy-policy">Privacy Policy</a>.
              </p>
            </form>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white py-10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="w-full h-full rounded-xl overflow-hidden">
              {userLocation.error && !userLocation.latitude ? (
                <div className="flex items-center justify-center h-full bg-gray-200 text-gray-700 text-center p-4 rounded-xl">
                  <p>{userLocation.error}</p>
                  <p>The map is centered on UrbanTales Headquarters in Bengaluru.</p>
                </div>
              ) : (
                <MapContainer
                    center={userLocation.latitude && userLocation.longitude ? [userLocation.latitude, userLocation.longitude] : defaultMapCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '350px', width: '100%' }}
                    key={`${userLocation.latitude}-${userLocation.longitude}`}
                >
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {userLocation.latitude && userLocation.longitude && (
                      <LocationMarker position={userLocation} />
                  )}
                  {!userLocation.latitude && !userLocation.longitude && (
                      <Marker position={defaultMapCenter}>
                          <Popup>UrbanTales Headquarters (Bengaluru)</Popup>
                      </Marker>
                  )}
                </MapContainer>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Our Location</h3>
              <h4 className="text-lg font-medium">Connecting Near and Far</h4>
              {userLocation.latitude && userLocation.longitude && (
                  <p className="mt-2 text-sm">
                    Your current coordinates: <br />
                    Latitude: {userLocation.latitude.toFixed(6)}, Longitude: {userLocation.longitude.toFixed(6)}
                  </p>
              )}
              <p className="mt-2 text-sm">
                UrbanTales Inc. <br />
                Buildings Alyssa, Begonia & Clove Embassy Tech Village, <br />
                Outer Ring Road, Devarabeesanahalli Village, <br />
                Bengaluru, 560103, <br />
                Karnataka, India
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-100 py-10">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions (FAQ)</h2>
            <div className="mb-6">
              <h4 className="text-lg font-medium">Do you have any questions for us?</h4>
              <form className="mt-2 flex gap-4" onSubmit={onFaqSubmit}>
                <input
                  type="email"
                  name="email"
                  value={faqEmail}
                  onChange={(e) => setFaqEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 border rounded-lg px-4 py-2"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#070A52] text-white px-4 py-2 rounded-lg hover:bg-[#FFCC00]"
                >
                  Submit
                </button>
              </form>
              {faqMessage && (
                <p className="text-sm text-green-600 mt-2">{faqMessage}</p>
              )}
            </div>

            <div className="space-y-4">
  {[{
    q: "What makes UrbanTales different from other e-commerce platforms?",
    a: "UrbanTales stands out with its user-friendly interface, lightning-fast performance, and a carefully curated collection of quality products."
  }, {
    q: "How secure is shopping on UrbanTales?",
    a: "We use industry-standard encryption and secure payment gateways to protect your personal and payment details."
  }, {
    q: "Can I personalize my UrbanTales experience?",
    a: "Yes! Customize notifications, manage preferences, and track orders in your account."
  }, {
    q: "What features does UrbanTales offer for groups or communities?",
    a: "Group buying, shared wishlists, referral rewards, and curated product collections are all available."
  }].map((item, index) => (
    <details key={`${item.q}-${index}`} className="bg-white rounded-lg p-4 shadow">
      <summary className="cursor-pointer font-medium">{item.q}</summary>
      <p className="mt-2 text-sm text-gray-600">{item.a}</p>
    </details>
  ))}
</div>

          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to experience the ease and excitement of shopping with UrbanTales?
          </h2>
          <div className="space-x-4">
            <Link to="/">
              <button className="bg-[#070A52] text-white px-6 py-2 rounded-lg hover:bg-[#FFCC00]">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
