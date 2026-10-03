import React, { useEffect, useState } from "react";
import { HashLoader } from "react-spinners"; 
import Navbar from "../Components/Navbar"; 
import Footer from "../Components/Footer"; 
import arpanJain from '../assets/arpan-jain.png';

const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  // In a real application, you would use a router, e.g., from 'react-router-dom'
  // const navigate = useNavigate();
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would be `navigate(path);`
  };

  useEffect(() => {
    // Set a timeout to hide the loader after 2 seconds
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer); // Clear timeout on component unmount
  }, []);

  // Show loader while loading is true
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        {/* HashLoader component with customizable color and size */}
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  const teamMembers = [
    {
      id: 1,
      name: 'Arpan Jain',
      role: 'Full Stack Developer | QA & Testing',
      image: arpanJain, // Placeholder image
      linkedin: 'https://www.linkedin.com/in/arpan-jain-42386b2a7/', // Updated LinkedIn URL
      whatsapp: 'https://wa.me/6399003541', // Replace with actual WhatsApp number
    },
    {
      id: 2,
      name: 'Sneha Maurya',
      role: 'UI/UX Designer',
      image: 'https://media.licdn.com/dms/image/v2/D5603AQFOc-eDqqSBeg/profile-displayphoto-shrink_400_400/B56ZdjbFqpG0Ak-/0/1749719735510?e=1755734400&v=beta&t=0xDvupGD18thLgtaVHFbuCEIQN9lvdKrWpV7n_6x1LY', // Placeholder image
      linkedin: 'https://www.linkedin.com/in/sneha-maurya-809478255/', // Replace with actual LinkedIn URL
      whatsapp: 'https://wa.me/6392147566', // Replace with actual WhatsApp number
    },
    {
      id: 3,
      name: 'Pawan Patel',
      role: 'Backend Developer',
      image: 'https://media.licdn.com/dms/image/v2/D4D35AQGg1I7NhWJtCg/profile-framedphoto-shrink_200_200/B4DZVSlcPjG8AY-/0/1740847301863?e=1753725600&v=beta&t=HYFUwmTR_GE-QqfuITD7ELnER5Asrw9xobGT4N8I5Hw', // Placeholder image
      linkedin: 'https://www.linkedin.com/in/pavan-patel-304334337/', // Replace with actual LinkedIn URL
      whatsapp: 'https://wa.me/6307477396', // Replace with actual WhatsApp number
    },
  ];

  return (
    <div className="relative overflow-x-hidden text-gray-800 bg-gray-50 font-[Poppins]">
      <Navbar />

      {/* Hero Section */}
      <section
        className="text-center py-32 px-5 relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(https://placehold.co/1920x600/34495E/FFFFFF?text=UrbanTales+Hero)` }} // New placeholder image for urban theme
      >
        <div className="absolute inset-0 bg-black opacity-50"></div> {/* Dark overlay */}
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4">
            Welcome to UrbanTales
          </h1>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mt-6 leading-relaxed">
            Your Premium Online Shopping Destination for the Modern Urbanite.
          </p>

          <a
            href="/"
            className="inline-block mt-10 px-10 py-4 bg-[#070A52] text-white rounded-full font-semibold text-lg shadow-xl
                       hover:scale-105 hover:bg-[#FFCC00] transition-all duration-300 transform hover:rotate-1"
          >
            Start Shopping
          </a>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-5 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Who We Are</h2>
          <div className="h-1.5 w-24 mx-auto bg-[#070A52] rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-5 leading-tight">
              Curating Your Urban Story
            </h2>
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              At UrbanTales, we believe every purchase tells a story. We're not just an e-commerce platform; we're your trusted curator of quality products that enhance your modern urban lifestyle.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our mission is to redefine online retail by offering a seamless blend of style, convenience, and exceptional customer service, ensuring every item you choose adds a unique chapter to your urban tale.
            </p>
          </div>
          <div>
            <img
              className="w-full rounded-xl shadow-xl border border-gray-200 transform hover:scale-105 transition-transform duration-300"
              src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80" // New image for urban theme
              alt="UrbanTales Shopping"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-5 py-24 bg-gray-100 rounded-xl shadow-inner">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Why Choose UrbanTales?
          </h2>
          <div className="h-1.5 w-24 mx-auto bg-[#070A52] rounded-full"></div>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [
              "🛍️",
              "Curated Collections",
              "Hand-picked products that align with modern urban trends and quality.",
            ],
            [
              "🚚",
              "Swift Delivery",
              'Get your orders delivered with speed and precision, right to your door.',
            ],
            [
              "💎",
              "Exclusive Deals",
              "Access special discounts and offers tailored for our community.",
            ],
            [
              "🌟",
              "Premium Quality",
              "Only the finest products from trusted brands and artisans.",
            ],
            [
              "↩️",
              "Hassle-Free Returns",
              "Easy and straightforward return policy for your peace of mind.",
            ],
            [
              "📞",
              "Dedicated Support",
              "Our team is always ready to assist you, day or night.",
            ],
          ].map(([icon, title, text], i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg
                         transform transition-all duration-300
                         hover:scale-[1.04] hover:-translate-y-2 hover:shadow-2xl " // Enhanced hover effect with ring
            >
              <div className="text-5xl mb-6">{icon}</div>
              <h3 className="text-2xl text-gray-800 font-semibold mb-3 leading-tight">
                {title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-5 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Meet Our Team
          </h2>
          <div className="h-1.5 w-24 mx-auto bg-[#070A52] rounded-full"></div>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 justify-items-center">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="relative group bg-white p-8 rounded-2xl shadow-xl border border-gray-100 overflow-hidden
                         transform transition-all duration-500
                         hover:scale-[1.06] hover:-translate-y-3 hover:shadow-2xl 
                         flex flex-col items-center justify-center text-center"
            >
              <div className="w-40 h-40 rounded-xl overflow-hidden mx-auto mb-6 border-4 border-[#070A52] shadow-lg
                              group-hover:border-[#FFCC00] transition-colors duration-300">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {member.name}
              </h3>
              <p className="text-lg text-gray-600 mb-6">{member.role}</p>

              <div className="flex space-x-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-y-0 translate-y-4">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-white bg-gray-200 hover:bg-blue-600 p-3 rounded-full transition-all duration-300 transform hover:scale-125 shadow-md"
                    title={`Connect with ${member.name} on LinkedIn`}
                  >
                    {/* LinkedIn Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="inline-block"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.044-1.852-3.044-1.853 0-2.136 1.445-2.136 2.951v5.662H9.554V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm-.007 13.012H2.288V9h3.049v11.445zM22.223 0H1.777C.8 0 0 .81 0 1.791v20.418C0 23.19 1.791 24 2.777 24h19.447c.976 0 1.777-.81 1.777-1.791V1.791C24 .81 23.19 0 22.223 0z" />
                    </svg>
                  </a>
                )}
                {member.whatsapp && (
                  <a
                    href={member.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-white bg-gray-200 hover:bg-green-500 p-3 rounded-full transition-all duration-300 transform hover:scale-125 shadow-md"
                    title={`Chat with ${member.name} on WhatsApp`}
                  >
                    {/* WhatsApp Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="inline-block"
                    >
                      <path d="M12.04 2C7.03 2 3 6.03 3 11.04c0 1.78.5 3.45 1.37 4.9L3.12 21.04l5.14-1.35c1.4-.76 2.97-1.16 4.38-1.16 5.01 0 9.04-4.03 9.04-9.04S17.05 2 12.04 2zm0 16.5c-1.28 0-2.5-.35-3.56-.96l-.25-.15-2.61.69.7-2.54-.17-.27c-.66-1.05-1.01-2.26-1.01-3.57 0-4.08 3.32-7.4 7.4-7.4s7.4 3.32 7.4 7.4c0 4.08-3.32 7.4-7.4 7.4zm4.1-5.74c-.22-.11-.96-.47-1.11-.52-.15-.05-.26-.07-.37.07-.11.15-.43.52-.52.63-.09.11-.18.12-.34.04-.15-.09-.64-.23-1.22-.75-.45-.4-.75-.72-.84-.88-.09-.15-.01-.11.08-.24.08-.13.19-.26.29-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.37-.88-.5-1.2-.14-.3-.12-.26-.26-.33-.14-.07-.3-.02-.45-.02-.15 0-.32-.01-.49-.01-.17 0-.45.06-.69.28-.24.22-.92.9-0.92 2.19 0 1.29.94 2.54 1.07 2.72.13.18 1.84 2.8 4.47 3.91 2.63 1.11 2.63.74 2.94.69.31-.05.96-.39 1.09-.72.13-.33.13-.61.09-.72-.04-.11-.15-.15-.32-.24z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-5 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Our Location
          </h2>
          <div className="h-1.5 w-24 mx-auto bg-[#070A52] rounded-full"></div>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
          <iframe
            className="w-full h-[450px]"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.6195134142135!2d77.68777847512216!3d12.93215878737963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae13a8d37051e1%3A0x441b54d2e7912e06!2sEmbassy%20TechVillage!5e0!3m2!1sen!2sin!4v1752650865941!5m2!1sen!2sin"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-28 px-5 bg-gradient-to-r from-gray-50 to-gray-100">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">
          Ready to Discover Your Urban Tale?
        </h2>
        <button
          onClick={() => navigate("/")}
          className="inline-block px-12 py-5 bg-[#070A52] text-white rounded-full font-semibold text-xl shadow-xl
                     hover:scale-105 hover:bg-[#FFCC00] transition-all duration-300 transform hover:rotate-2"
        >
          Explore Products Now
        </button>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
