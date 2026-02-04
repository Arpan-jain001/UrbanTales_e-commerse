import React from "react";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "John Doe",
    text: "SuperMarket always delivers fresh groceries on time. The variety and quality are unmatched!",
    image:
      "https://i.pinimg.com/736x/08/1a/03/081a03c39e724087a8152318c4c39d49.jpg",
  },
  {
    name: "Priya Sharma",
    text: "I love shopping at SuperMarket! The discounts and offers are great, and the service is excellent.",
    image:
      "https://i.pinimg.com/736x/53/5e/ca/535eca1fe2ef89daf5d6f51eb93058b4.jpg",
  },
  {
    name: "Amit Verma",
    text: "The customer support is amazing. Highly recommended for daily needs!",
    image:
      "https://i.pinimg.com/736x/86/bc/f3/86bcf364a2d6328d9b9cd00e4edee2b4.jpg",
  },
  {
    name: "Sara Lee",
    text: "Great experience every time! SuperMarket makes grocery shopping easy and convenient.",
    image:
      "https://i.pinimg.com/736x/38/24/3e/38243e5bcf61681efd377c461f19fde7.jpg",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const card = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

const ReviewCard = ({ name, text, image }) => (
  <motion.div
    variants={card}
    whileHover={{ y: -10, scale: 1.03 }}
    transition={{ type: "spring", stiffness: 200 }}
    className="relative bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl
               w-[320px] h-[280px] px-6 pt-16 pb-6 flex flex-col items-center
               hover:shadow-2xl border border-white/40"
  >
    {/* Avatar */}
    <div className="absolute -top-14 w-28 h-28 rounded-full border-[5px] border-white shadow-lg overflow-hidden bg-white">
      <img src={image} alt={name} className="w-full h-full object-cover" />
    </div>

    {/* Name */}
    <h3 className="font-bold text-lg mt-4 text-gray-800">{name}</h3>

    {/* Review */}
    <p className="text-sm text-gray-600 text-center mt-3 leading-relaxed">
      {text}
    </p>

    {/* Stars */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-auto text-yellow-400 text-xl tracking-wide"
    >
      ★★★★★
    </motion.div>
  </motion.div>
);

const CustomerReviews = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-[#f3f4f6] via-[#eeeeee] to-[#f9fafb] overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl" />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16 relative z-10"
      >
        <h2 className="text-4xl font-extrabold text-gray-800">
          What Our Customers Say
        </h2>
        <p className="mt-3 text-gray-600 max-w-xl mx-auto">
          Real experiences from people who trust SuperMarket for their daily needs.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative z-10 flex flex-wrap justify-center gap-10 px-6"
      >
        {reviews.map((review, index) => (
          <ReviewCard key={index} {...review} />
        ))}
      </motion.div>
    </section>
  );
};

export default CustomerReviews;
