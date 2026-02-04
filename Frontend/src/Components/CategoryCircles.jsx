import { Link } from "react-router-dom";
import { useEffect } from "react";

const categories = [
  { id: 1, name: "Fashion", image: "https://i.pinimg.com/1200x/16/ea/40/16ea40729954d9f7955c0aa18b5311a7.jpg", category: "fashion" },
  { id: 2, name: "Electronics", image: "https://i.pinimg.com/736x/a3/4a/d1/a34ad1d68f5c3f01d7fb21119c556ffe.jpg", category: "electronic" },
  { id: 3, name: "Furniture", image: "https://i.pinimg.com/736x/6b/27/24/6b2724cd4ec8013e4b537cd1c5a8893d.jpg", category: "furniture" },
  { id: 4, name: "Appliances", image: "https://i.pinimg.com/1200x/e1/b6/98/e1b698b84d069ca72d7bc57c5152ed82.jpg", category: "kitchen" },
  { id: 5, name: "Toys", image: "https://i.pinimg.com/736x/a7/ef/07/a7ef075291c451a438d5b737474b1957.jpg", category: "toys" },
  { id: 6, name: "Cosmetics", image: "https://i.pinimg.com/1200x/0a/b0/cc/0ab0cc09d08e1816b89f273e18a4dd74.jpg", category: "cosmetic" },
  { id: 7, name: "Kilos", image: "https://i.pinimg.com/1200x/56/2d/ed/562ded9c5674b296bf21256d5663e9ec.jpg", category: "food" },
  { id: 8, name: "Sports", image: "https://i.pinimg.com/1200x/91/37/75/9137759fe8d4bd3692e1538f4edd400a.jpg", category: "sports" },
];

function CategoryCircles() {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("animate-in");
      });
    });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F9FAFB] to-[#EEF1F6] px-4 py-14">

      {/* floating particles */}
      <div className="absolute inset-0 particles -z-10"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-10 place-items-center">

        {categories.map((cat) => (
          <Link
            to={`/category?cat=${cat.category}`}
            key={cat.id}
            className="reveal group flex flex-col items-center transition-all duration-500"
          >
            {/* glass circle */}
            <div className="circle-glow relative w-24 h-24 rounded-full p-[3px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            {/* label */}
            <div className="relative mt-4">
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#070A52] transition-colors">
                {cat.name}
              </span>
              <span className="underline-anim" />
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        /* scroll reveal */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .reveal.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* glow ring */
        .circle-glow {
          backdrop-filter: blur(12px);
          background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.2));
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          transition: all 0.4s ease;
        }

        .group:hover .circle-glow {
          box-shadow: 0 0 25px rgba(7,10,82,0.35), 0 20px 40px rgba(0,0,0,0.25);
          transform: translateY(-6px);
        }

        /* underline animation */
        .underline-anim {
          position: absolute;
          left: 50%;
          bottom: -4px;
          height: 2px;
          width: 0;
          background: #070A52;
          transition: all 0.3s ease;
        }

        .group:hover .underline-anim {
          width: 100%;
          left: 0;
        }

        /* particles */
        .particles {
          background:
            radial-gradient(circle at 20% 30%, rgba(0,0,0,0.05) 2px, transparent 2px),
            radial-gradient(circle at 70% 60%, rgba(0,0,0,0.04) 2px, transparent 2px),
            radial-gradient(circle at 40% 80%, rgba(0,0,0,0.03) 2px, transparent 2px);
          background-size: 200px 200px;
          animation: floatParticles 30s linear infinite;
        }

        @keyframes floatParticles {
          from { background-position: 0 0, 0 0, 0 0; }
          to { background-position: 400px 400px, -400px 400px, 400px -400px; }
        }
      `}</style>
    </section>
  );
}

export default CategoryCircles;
