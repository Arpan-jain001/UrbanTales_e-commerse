import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import '../Styles/swiper-custom.css';

const slides = [
  {
    img: 'https://assets.myntassets.com/f_webp,w_980,c_limit,fl_progressive,dpr_2.0/assets/images/2025/7/22/7f390c5f-bfe9-4a88-a520-5db4588cf72e1753185543502-Menspage.png',
    text: 'UrbanTales Collection 2026'
  },
  {
    img: 'https://cmsimages.shoppersstop.com/Fragrance_Affair_KV_30th_May_25_web_2119c126b7/Fragrance_Affair_KV_30th_May_25_web_2119c126b7.jpg',
    text: 'Luxury Redefined'
  },
  {
    img: 'https://cmsimages.shoppersstop.com/Entry_Banner_web_90704e9cc4/Entry_Banner_web_90704e9cc4.png',
    text: 'New Season Drop'
  },
  {
    img: 'https://cmsimages.shoppersstop.com/Mac_Web_6e9bc3db68/Mac_Web_6e9bc3db68.jpg',
    text: 'Modern Essentials'
  },
  {
    img: 'https://cmsimages.shoppersstop.com/GIF_Colour_Pop_SS_Web_cc91c55982/GIF_Colour_Pop_SS_Web_cc91c55982.gif',
    text: 'Express Your Style'
  }
];

const PromoSlider = () => {
  useEffect(() => {
    const pagination = document.querySelector('.swiper-pagination');
    if (pagination) {
      pagination.style.position = 'relative';
      pagination.style.marginTop = '1rem';
    }
  }, []);

  return (
    <section className="w-full relative overflow-hidden">

      {/* floating particles */}
      <div className="particles absolute inset-0 -z-10"></div>

      {/* powered chip */}
      <div className="urban-chip">Powered by UrbanTales</div>

      <Swiper
        className="mySwiper"
        loop
        effect="fade"
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination, EffectFade]}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i} className="flex justify-center items-center">
            <div
              className="
                slide-glass relative w-full
                h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px]
                flex justify-center items-center overflow-hidden
              "
            >
              <img
                src={slide.img}
                alt={`Slide ${i + 1}`}
                className="zoom-img w-full h-full object-cover object-top"
              />

              {/* gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

              {/* caption */}
              <div className="caption absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 text-white">
                {slide.text}
              </div>

              <div className="overlay-glow"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        /* cinematic zoom */
        .zoom-img {
          animation: zoomSlow 12s ease-in-out infinite alternate;
        }

        @keyframes zoomSlow {
          from { transform: scale(1); }
          to { transform: scale(1.12); }
        }

        /* caption responsive */
        .caption {
          font-size: clamp(16px, 4vw, 28px);
          font-weight: 700;
          letter-spacing: 1px;
          animation: captionFade 1.4s ease forwards;
          max-width: 85%;
        }

        @keyframes captionFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* glass glow overlay */
        .overlay-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255,255,255,0.12), transparent);
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        /* floating particles */
        .particles {
          background:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 2px, transparent 2px),
            radial-gradient(circle at 70% 60%, rgba(255,255,255,0.15) 2px, transparent 2px),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 2px, transparent 2px);
          background-size: 200px 200px;
          animation: floatParticles 25s linear infinite;
        }

        @keyframes floatParticles {
          from { background-position: 0 0, 0 0, 0 0; }
          to { background-position: 400px 400px, -400px 400px, 400px -400px; }
        }

        /* blinking chip responsive */
        .urban-chip {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 20;
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 600;
          color: white;
          backdrop-filter: blur(10px);
          background: rgba(0,0,0,0.45);
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.2);
          animation: blinkChip 1.8s infinite;
        }

        @media (min-width: 640px) {
          .urban-chip {
            top: 10px;
            right: 12px;
            padding: 6px 14px;
            font-size: 12px;
          }
        }

        @keyframes blinkChip {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(255,255,255,0.5); }
          50% { opacity: 0.5; box-shadow: 0 0 0 rgba(255,255,255,0); }
        }
      `}</style>

    </section>
  );
};

export default PromoSlider;
