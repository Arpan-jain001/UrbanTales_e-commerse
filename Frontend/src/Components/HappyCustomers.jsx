import React from "react";
import { motion } from "framer-motion";

const customers = [
  {
    username: "ragini_singh",
    image:
      "https://i.pinimg.com/736x/82/62/4a/82624a1dbf495ffcc9ed17eeeb8a54ed.jpg",
  },
  {
    username: "rahul_s",
    image:
      "https://i.pinimg.com/736x/7a/e5/4c/7ae54cd93f3909858f19595247e5b1ce.jpg",
  },
  {
    username: "sneha6392",
    image:
      "https://i.pinimg.com/1200x/09/b7/8a/09b78a87256692629103695c50836fb4.jpg",
  },
  {
    username: "manya_m",
    image:
      "https://i.pinimg.com/736x/c3/e0/ff/c3e0ff874c54abde6c9f2ed13093c3d8.jpg",
  },
  {
    username: "ravi",
    image:
      "https://i.pinimg.com/736x/2c/3a/c3/2c3ac337919749e5280fe6e9aad4256b.jpg",
  },
  {
    username: "saif_ali",
    image:
      "https://i.pinimg.com/1200x/c2/31/9c/c2319c925555c8b07468cc1357e9c20a.jpg",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55 } },
};

const HappyCustomers = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-[#f3f4f6] via-[#eeeeee] to-[#f9fafb]">
      {/* Decorative blur blobs (same as reviews) */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl" />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12 relative z-10"
      >
        <h2 className="text-3xl md:text-4xl font-semibold text-[#070A52] tracking-wide">
          Our Happy Customers
        </h2>

        <p className="mt-3 text-base md:text-lg text-gray-600">
          Share your style with{" "}
          <span className="font-semibold text-[#070A52]">#HappyShopping</span>{" "}
          &{" "}
          <span className="font-semibold text-[#070A52]">#UrbanTalesFam</span>
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-7xl mx-auto px-4"
      >
        {customers.map((customer, index) => (
          <motion.div
            key={index}
            variants={item}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="group cursor-pointer"
          >
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm group-hover:shadow-xl transition-shadow duration-300">
              {/* Image */}
              <motion.img
                src={customer.image}
                alt={customer.username}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.45 }}
                loading="lazy"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Username chip */}
              <div className="absolute left-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20">
                  @{customer.username}
                </span>
              </div>
            </div>

            {/* Mobile username */}
            <p className="mt-2 text-center text-sm font-medium text-gray-700 md:hidden">
              @{customer.username}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HappyCustomers;
