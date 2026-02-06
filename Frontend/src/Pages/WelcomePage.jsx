import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { HashLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import {
  User,
  Store,
  Shield,
  Sparkles,
  ShoppingBag,
  BadgeCheck,
  Truck,
  Lock,
  ArrowRight,
} from 'lucide-react';

function useTilt() {
  const ref = useRef(null);

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateX = ((y - midY) / midY) * -6; // tilt strength
    const rotateY = ((x - midX) / midX) * 6;

    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
  };

  return { ref, onMouseMove, onMouseLeave };
}

const RoleCard = ({
  active,
  type,
  title,
  subtitle,
  icon: Icon,
  badge,
  tone = 'blue',
  onClick,
}) => {
  const tilt = useTilt();

  const toneMap = {
    blue: {
      ring: 'ring-blue-200',
      iconBg: 'bg-blue-50',
      iconText: 'text-blue-700',
      accent: 'from-blue-600 to-cyan-500',
      soft: 'bg-blue-50/60',
      text: 'text-blue-900',
      border: 'border-blue-200',
      chip: 'bg-blue-100 text-blue-800',
    },
    pink: {
      ring: 'ring-pink-200',
      iconBg: 'bg-pink-50',
      iconText: 'text-pink-700',
      accent: 'from-pink-600 to-rose-500',
      soft: 'bg-pink-50/60',
      text: 'text-pink-800',
      border: 'border-pink-200',
      chip: 'bg-pink-100 text-pink-800',
    },
    indigo: {
      ring: 'ring-indigo-200',
      iconBg: 'bg-indigo-50',
      iconText: 'text-indigo-700',
      accent: 'from-indigo-600 to-violet-500',
      soft: 'bg-indigo-50/60',
      text: 'text-indigo-900',
      border: 'border-indigo-200',
      chip: 'bg-indigo-100 text-indigo-800',
    },
  };

  const t = toneMap[tone];

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      onClick={() => onClick(type)}
      className="relative w-full text-left"
    >
      {/* animated border (active) */}
      {active && (
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-600 via-pink-600 to-indigo-600 animate-borderSpin blur-[0.2px]" />
      )}

      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className={`relative rounded-2xl border bg-white/85 backdrop-blur-md p-5 md:p-6 shadow-lg transition-all duration-300
        ${active ? `ring-4 ${t.ring} ${t.border}` : 'border-gray-200 hover:shadow-xl'}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`h-12 w-12 rounded-xl ${t.iconBg} border border-white shadow-sm flex items-center justify-center`}
            >
              <Icon className={`w-6 h-6 ${t.iconText}`} />
            </div>

            <div>
              <div className={`text-lg font-extrabold ${t.text}`}>{title}</div>
              <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
            </div>
          </div>

          {badge && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.chip}`}>
              {badge}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${t.soft} ${t.text}`}>
            Tap to continue
          </div>

          <div
            className={`h-9 w-9 rounded-xl bg-gradient-to-r ${t.accent} flex items-center justify-center shadow-md`}
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // auto highlight based on route
  useEffect(() => {
    const p = location.pathname;
    if (p.startsWith('/admin')) setActive('admin');
    else if (p.startsWith('/seller')) setActive('seller');
    else setActive('user');
  }, [location.pathname]);

  const handleClick = (type) => {
    setActive(type);
    if (type === 'seller') navigate('/seller-onboarding');
    else if (type === 'admin') navigate('/admin/login');
    else navigate('/login');
  };

  const stats = useMemo(
    () => [
      { Icon: BadgeCheck, label: 'Trusted shopping', sub: 'Quality products' },
      { Icon: Truck, label: 'Fast delivery', sub: 'Smooth experience' },
      { Icon: Lock, label: 'Secure login', sub: 'Safe accounts' },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="relative min-h-[78vh] overflow-hidden bg-gradient-to-b from-white via-blue-50 to-gray-50 px-4 py-10">
        {/* background */}
        <div className="absolute inset-0 pointer-events-none opacity-40 particles-bg" />
        <div className="absolute -top-24 -left-24 h-72 w-72 bg-blue-200 rounded-full blur-3xl opacity-45" />
        <div className="absolute -bottom-28 -right-28 h-80 w-80 bg-pink-200 rounded-full blur-3xl opacity-35" />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* LEFT HERO */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-md shadow-xl p-7 md:p-9 relative overflow-hidden">
                {/* glow lines */}
                <div className="absolute -top-24 -right-24 h-64 w-64 bg-indigo-200 rounded-full blur-3xl opacity-35" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-cyan-200 rounded-full blur-3xl opacity-25" />

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    UrbanTales • 2026
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-800">
                    Premium Experience
                  </span>
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight">
                  Welcome to <span className="text-pink-600">UrbanTales</span>
                </h1>

                <p className="mt-4 text-gray-700 text-lg max-w-2xl">
                  A smarter eCommerce experience — choose your role and continue with a clean, secure and modern flow.
                </p>

                <div className="mt-6 flex items-center gap-2 text-blue-900/80">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    Smooth animations • Clean UI • Fast navigation
                  </span>
                </div>

                {/* stats */}
                <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {stats.map(({ Icon, label, sub }, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-2 text-blue-900">
                        <Icon className="w-5 h-5" />
                        <div className="text-sm font-bold">{label}</div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{sub}</div>
                    </div>
                  ))}
                </div>

                {/* mock preview bar */}
                <div className="mt-7 rounded-2xl border border-gray-200 bg-white/70 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-bold text-blue-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      Quick Start
                    </div>
                    <div className="text-gray-600">Pick a role → Continue</div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-blue-600 to-pink-600 rounded-full animate-progress" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT ROLE CARDS */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-md shadow-xl p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-600">Choose your role</div>
                    <div className="text-2xl font-extrabold text-blue-900 mt-1">Continue as</div>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-blue-600 to-pink-600 flex items-center justify-center shadow-md">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <RoleCard
                    active={active === 'user'}
                    type="user"
                    title="User"
                    subtitle="Login & explore products"
                    icon={User}
                    badge="Buyer"
                    tone="blue"
                    onClick={handleClick}
                  />
                  <RoleCard
                    active={active === 'seller'}
                    type="seller"
                    title="Seller"
                    subtitle="Onboarding & sell products"
                    icon={Store}
                    badge="Business"
                    tone="pink"
                    onClick={handleClick}
                  />
                  <RoleCard
                    active={active === 'admin'}
                    type="admin"
                    title="Admin"
                    subtitle="Manage platform & orders"
                    icon={Shield}
                    badge="Control"
                    tone="indigo"
                    onClick={handleClick}
                  />
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                  By continuing, you agree to UrbanTales basic policies.
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CSS */}
        <style>{`
          .particles-bg{
            background-image:
              radial-gradient(circle at 20% 30%, rgba(59,130,246,0.25) 1.2px, transparent 1.3px),
              radial-gradient(circle at 70% 20%, rgba(236,72,153,0.22) 1.2px, transparent 1.3px),
              radial-gradient(circle at 35% 75%, rgba(99,102,241,0.18) 1.2px, transparent 1.3px),
              radial-gradient(circle at 80% 70%, rgba(59,130,246,0.18) 1.2px, transparent 1.3px);
            background-size: 120px 120px;
            animation: floatDots 10s ease-in-out infinite;
          }
          @keyframes floatDots{
            0%{ transform: translate3d(0,0,0); }
            50%{ transform: translate3d(-18px, 12px, 0); }
            100%{ transform: translate3d(0,0,0); }
          }
          @keyframes borderSpin {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
          }
          .animate-borderSpin{ animation: borderSpin 4s linear infinite; }
          @keyframes progress {
            0% { transform: translateX(-35%); }
            50% { transform: translateX(10%); }
            100% { transform: translateX(-35%); }
          }
          .animate-progress{ animation: progress 2.4s ease-in-out infinite; }
        `}</style>
      </div>

      <Footer />
    </>
  );
}
