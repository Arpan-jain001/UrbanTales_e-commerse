import React from "react";
import { useNavigate } from "react-router-dom";

const promos = [
  {
    img: "https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/4be945094f5ac616.jpeg?q=60",
    alt: "Banner 1",
    headline: "Mega Electronics Sale",
    cta: "Shop Now",
    href: "/category?cat=electronic",
    span: "lg:col-span-2 lg:row-span-1",
  },
  {
    img: "https://rukminim2.flixcart.com/www/1060/1560/promos/26/09/2023/6c3c5fe2-c236-4fa2-8d97-595e1e01da01.jpg?q=60",
    alt: "Banner 2",
    headline: "Cashback Offers",
    cta: "Grab Offer",
    href: "/category?cat=fashion",
    span: "lg:col-span-1 lg:row-span-2",
  },
  {
    img: "https://i.pinimg.com/736x/e1/0a/90/e10a901022ea33daad5f9bb035da7afd.jpg",
    alt: "Banner 3",
    headline: "Fashion Fest",
    cta: "Explore",
    href: "/category?cat=cosmetic",
    span: "lg:col-span-1 lg:row-span-2",
  },
  {
    img: "https://i.pinimg.com/736x/16/8c/71/168c7155ca5256ccdb949133614f136e.jpg",
    alt: "Banner 4",
    headline: "Beauty Deals",
    cta: "Shop Beauty",
    href: "/category?cat=cosmetic",
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    img: "https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/74f0ad81e44e6e6f.jpg?q=60",
    alt: "Banner 5",
    headline: "Home Essentials",
    cta: "Upgrade Home",
    href: "/category?cat=furniture",
    span: "lg:col-span-2 lg:row-span-1",
  },
];

const PromoGrid = () => {
  const navigate = useNavigate();

  const handleClick = (href) => {
    if (href) navigate(href);
  };

  return (
    <div className="p-5 bg-gray-100 font-sans">
      <div className="max-w-[1500px] mx-auto grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[200px]">
        {promos.map((promo, idx) => (
          <div
            key={idx}
            className={`${promo.span} relative rounded-xl overflow-hidden cursor-pointer group`}
            onClick={() => handleClick(promo.href)}
          >
            {/* Image */}
            <img
              src={promo.img}
              alt={promo.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Text & CTA */}
            <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="text-lg font-bold">{promo.headline}</h3>
              <button className="mt-2 px-4 py-1 bg-yellow-400 text-black rounded-full text-sm font-medium hover:bg-yellow-300">
                {promo.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoGrid;
