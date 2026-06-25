import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useInView as useInViewHook } from 'react-intersection-observer';
import {
  ArrowRight, ChevronDown, Star, MapPin, Truck, Shield, Clock,
  Leaf, Sprout, Heart, ShoppingBag, ChevronLeft, ChevronRight,
  Minus, Plus, Zap, Users, Package, TrendingUp
} from 'lucide-react';

// =============== HERO SECTION ===============
function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.1]);

  const slides = [
    {
      title: 'Farm Fresh,\nDirect to You',
      subtitle: 'From local farmers to your table in under 2 hours',
      gradient: 'from-sky-900/80 via-sky-800/70 to-emerald-900/80',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=80',
    },
    {
      title: 'Support Local\nFarmers',
      subtitle: 'Every purchase helps sustain local farming communities',
      gradient: 'from-emerald-900/80 via-emerald-800/70 to-sky-900/80',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80',
    },
    {
      title: '100% Organic\n& Fresh',
      subtitle: 'Pesticide-free produce grown with love and care',
      gradient: 'from-neutral-900/80 via-neutral-800/70 to-sky-900/80',
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&q=80',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden" id="hero">
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ y, scale }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${slides[currentSlide].gradient}`} />
        </motion.div>
      </AnimatePresence>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div style={{ opacity }} className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6"
                >
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  <span>Hyperlocal Farm Marketplace</span>
                </motion.div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6 whitespace-pre-line font-[family-name:var(--font-display)]">
                  {slides[currentSlide].title}
                </h1>

                <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-lg leading-relaxed">
                  {slides[currentSlide].subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/products"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-neutral-900 font-bold text-lg rounded-2xl hover:bg-sky-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    id="hero-cta-shop"
                  >
                    Shop Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/signup?role=farmer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                    id="hero-cta-farmer"
                  >
                    <Leaf className="w-5 h-5" />
                    Become a Seller
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide indicators */}
            <div className="flex items-center gap-2 mt-12">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentSlide ? 'w-10 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'
                  }`}
                  id={`hero-slide-${i}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-8 h-8 text-white/50" />
      </motion.div>
    </section>
  );
}

// =============== HOW IT WORKS ===============
function HowItWorksSection() {
  const { ref, inView } = useInViewHook({ triggerOnce: true, threshold: 0.2 });

  const steps = [
    { icon: MapPin, title: 'Discover Nearby', desc: 'Find local farmers within 10km of your location', color: 'from-sky-500 to-sky-600' },
    { icon: ShoppingBag, title: 'Shop Fresh', desc: 'Browse organic produce and add to your cart', color: 'from-emerald-500 to-emerald-600' },
    { icon: Truck, title: 'Quick Delivery', desc: 'Get farm-fresh produce delivered in under 2 hours', color: 'from-amber-500 to-amber-600' },
    { icon: Heart, title: 'Enjoy & Review', desc: 'Taste the freshness and support local farmers', color: 'from-rose-500 to-rose-600' },
  ];

  return (
    <section className="section bg-white" id="how-it-works" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge badge-sky mb-4 inline-flex">How it works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Farm to Table in <span className="gradient-text">4 Simple Steps</span>
          </h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            We've made it effortlessly simple to get the freshest produce from local farms directly to your kitchen.
          </p>
        </motion.div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-4 gap-8 lg:gap-12 relative">
          {/* Connecting line */}
          <div className="absolute top-10 left-[12%] right-[12%] h-[2px] bg-neutral-100 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center group z-10"
              >
                {/* Icon Card & Number Badge */}
                <div className="relative">
                  <div className={`w-20 h-20 rounded-2xl bg-white border border-neutral-100 shadow-md flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-1.5 transition-all duration-300`}>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-sm">
                    {i + 1}
                  </div>
                </div>

                {/* Step Title & Description */}
                <h3 className="text-lg font-bold text-neutral-900 mt-6 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-[200px]">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Layout (Vertical Timeline) */}
        <div className="md:hidden relative pl-8 ml-4 border-l border-neutral-200/80 space-y-12">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex flex-col items-start text-left group"
              >
                {/* Timeline badge/dot */}
                <div className="absolute -left-[49px] top-2 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-md">
                    {i + 1}
                  </div>
                </div>

                {/* Icon Card & Header */}
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">{step.title}</h3>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =============== WHY FARM2DOOR ===============
function WhySection() {
  const { ref, inView } = useInViewHook({ triggerOnce: true, threshold: 0.2 });

  const features = [
    { icon: Leaf, title: 'Farm Fresh Guarantee', desc: 'Every product comes directly from the farm. No middlemen, no warehouses.', color: 'bg-emerald-50 text-emerald-600' },
    { icon: Clock, title: 'Under 2 Hours', desc: 'Hyperlocal delivery ensures your produce arrives fresh and fast.', color: 'bg-sky-50 text-sky-600' },
    { icon: Shield, title: 'Quality Assured', desc: 'All farmers are verified. Products meet strict quality standards.', color: 'bg-amber-50 text-amber-600' },
    { icon: Users, title: 'Support Farmers', desc: 'Farmers keep 90%+ of the price. Fair trade, always.', color: 'bg-rose-50 text-rose-600' },
    { icon: Zap, title: 'Easy Ordering', desc: 'Browse, order, and track — all from your phone in seconds.', color: 'bg-purple-50 text-purple-600' },
    { icon: TrendingUp, title: 'Best Prices', desc: 'No middleman markup. Get farm-direct prices every day.', color: 'bg-teal-50 text-teal-600' },
  ];

  return (
    <section className="section bg-neutral-50" id="why-farm2door" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="badge badge-green mb-4 inline-flex">Why Farm2Door</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Built for <span className="gradient-text">Freshness</span>
          </h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            We're not just another delivery app. We're a movement to make farm-fresh food accessible to everyone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card p-6 group hover:border-sky-200"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =============== STATS SECTION ===============
function StatsSection() {
  const { ref, inView } = useInViewHook({
    triggerOnce: true,
    threshold: 0.3,
  });

  const stats = [
    { value: 2500, suffix: "+", label: "Local Farmers" },
    { value: 50000, suffix: "+", label: "Happy Customers" },
    { value: 15000, suffix: "+", label: "Products Available" },
    { value: 98, suffix: "%", label: "Satisfaction Rate" },
  ];

  return (
    <section
      ref={ref}
      id="stats"
      className="py-20 bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800 relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-400 blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
              }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2">
                {inView
                  ? `${stat.value.toLocaleString()}${stat.suffix}`
                  : `0${stat.suffix}`}
              </div>

              <p className="text-sky-200 font-medium text-sm sm:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
// =============== TESTIMONIALS ===============
function TestimonialsSection() {
  const { ref, inView } = useInViewHook({ triggerOnce: true, threshold: 0.2 });

  const testimonials = [
    { name: 'Priya Sharma', role: 'Customer, Delhi', text: 'The freshest vegetables I\'ve ever had delivered to my door. The tomatoes taste like they were just picked!', rating: 5, avatar: 'PS' },
    { name: 'Rajesh Kumar', role: 'Farmer, Karnataka', text: 'Farm2Door changed my life. I now earn 3x more by selling directly to customers. Best platform for farmers.', rating: 5, avatar: 'RK' },
    { name: 'Anita Patel', role: 'Customer, Mumbai', text: 'Love the organic produce selection. My family eats healthier now and I know exactly where our food comes from.', rating: 5, avatar: 'AP' },
    { name: 'Suresh Reddy', role: 'Farmer, Telangana', text: 'No more middlemen taking 50% of my earnings. Farm2Door gives me fair prices and direct access to customers.', rating: 5, avatar: 'SR' },
    { name: 'Meena Joshi', role: 'Customer, Bangalore', text: 'The delivery is incredibly fast! I ordered at 10 AM and had fresh greens by noon. Amazing service.', rating: 5, avatar: 'MJ' },
    { name: 'Vikram Singh', role: 'Delivery Partner', text: 'Great earning potential and flexible hours. The app makes it super easy to navigate and deliver.', rating: 5, avatar: 'VS' },
  ];

  return (
    <section className="section bg-white" id="testimonials" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="badge badge-amber mb-4 inline-flex">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Loved by <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Don't just take our word for it — hear from our farmers, customers, and delivery partners.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-6 hover:border-sky-200"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-900">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============== FAQ SECTION ===============
function FAQSection() {
  const { ref, inView } = useInViewHook({ triggerOnce: true, threshold: 0.2 });
  const [open, setOpen] = useState(null);

  const faqs = [
    { q: 'How does Farm2Door work?', a: 'Farm2Door connects you directly with local farmers in your area. Browse products, place orders, and get fresh produce delivered to your doorstep in under 2 hours.' },
    { q: 'Is the produce really organic?', a: 'Yes! All farmers on our platform are verified, and organic-certified products are clearly labeled. We conduct regular quality checks to ensure standards are maintained.' },
    { q: 'How do I become a seller on Farm2Door?', a: 'Simply sign up as a farmer, complete your profile with farm details and KYC documents, and wait for admin approval. Once approved, you can start listing your products immediately.' },
    { q: 'What areas do you deliver to?', a: 'We currently serve major cities across India. Delivery is available within a 10-50km radius of each farmer. Enter your location to see available farmers near you.' },
    { q: "What if I'm not satisfied with my order?", a: "We have a hassle-free return policy. If you're not satisfied with the quality of any product, file a complaint and we'll arrange a refund or replacement within 24 hours." },
    { q: 'How are farmers paid?', a: 'Farmers receive 90% of the product price directly to their bank account after order delivery. Payments are processed weekly with complete transparency.' },
  ];

  return (
    <section className="section bg-neutral-50" id="faq" ref={ref}>
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="badge badge-sky mb-4 inline-flex">FAQ</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Got <span className="gradient-text">Questions?</span>
          </h2>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto">
            We've got answers. If you can't find what you're looking for, reach out to us.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-300"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between gap-4 p-6 text-left"
                id={`faq-${i}`}
              >
                <span className="font-semibold text-base md:text-lg text-neutral-900 leading-snug mt-0.5">{faq.q}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${open === i ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                  {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-neutral-100 px-6 pt-4 pb-6">
                      <p className="text-neutral-600 text-sm md:text-base leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============== CTA SECTION ===============
function CTASection() {
  const { ref, inView } = useInViewHook({ triggerOnce: true, threshold: 0.3 });

  return (
    <section className="py-28 md:py-36 bg-neutral-950 relative overflow-hidden" id="cta" ref={ref}>
      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-sky-600/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-emerald-600/10 blur-[100px]" />
      </div>
      <div className="container relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/70 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Join 50,000+ happy customers
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to Taste the <span className="gradient-text-dark">Difference?</span>
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join thousands of happy customers who've made the switch to farm-fresh, locally sourced produce.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/signup" className="btn-primary !py-4 !px-12 !text-lg !rounded-2xl shadow-2xl shadow-sky-500/20 hover:shadow-sky-500/30" id="cta-signup">
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/signup?role=farmer" className="inline-flex items-center gap-2 py-4 px-12 text-lg font-semibold rounded-2xl bg-white/5 text-white border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all duration-300" id="cta-farmer">
              Join as Farmer
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =============== CATEGORIES SECTION ===============
function CategoriesSection() {
  const { ref, inView } = useInViewHook({ triggerOnce: true, threshold: 0.2 });

  const categories = [
    { name: 'Vegetables', emoji: '🥬', color: 'from-emerald-400 to-emerald-600', count: '2,500+' },
    { name: 'Fruits', emoji: '🍎', color: 'from-red-400 to-red-600', count: '1,800+' },
    { name: 'Dairy', emoji: '🥛', color: 'from-blue-400 to-blue-600', count: '800+' },
    { name: 'Grains', emoji: '🌾', color: 'from-amber-400 to-amber-600', count: '1,200+' },
    { name: 'Spices', emoji: '🌶️', color: 'from-orange-400 to-orange-600', count: '600+' },
    { name: 'Organic', emoji: '🌿', color: 'from-green-400 to-green-600', count: '3,000+' },
    { name: 'Herbs', emoji: '🌱', color: 'from-teal-400 to-teal-600', count: '400+' },
    { name: 'Honey', emoji: '🍯', color: 'from-yellow-400 to-yellow-600', count: '200+' },
  ];

  return (
    <section className="section bg-white" id="categories" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="badge badge-green mb-4 inline-flex">Categories</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Shop by <span className="gradient-text">Category</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={`/products?category=${cat.name.toLowerCase()}`}
                className="block p-6 rounded-2xl bg-neutral-50 hover:bg-white border border-transparent hover:border-neutral-200 hover:shadow-lg text-center group transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <h3 className="font-bold text-neutral-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-neutral-500">{cat.count} products</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============== FEATURED FARMERS CAROUSEL ===============
function FeaturedFarmersSection() {
  const { ref, inView } = useInViewHook({ triggerOnce: true, threshold: 0.2 });
  const [current, setCurrent] = useState(0);

  const farmers = [
    { name: 'Green Valley Organics', farmer: 'Ramesh Yadav', location: 'Karnataka', rating: 4.9, products: 45, specialty: 'Organic Vegetables', avatar: 'RY', image: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&q=80' },
    { name: 'Sunshine Farm', farmer: 'Lakshmi Devi', location: 'Tamil Nadu', rating: 4.8, products: 32, specialty: 'Fresh Fruits', avatar: 'LD', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80' },
    { name: 'Golden Harvest', farmer: 'Suresh Patel', location: 'Gujarat', rating: 4.9, products: 58, specialty: 'Grains & Millets', avatar: 'SP', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80' },
    { name: 'Pure Nature Dairy', farmer: 'Anand Singh', location: 'Punjab', rating: 4.7, products: 18, specialty: 'Dairy Products', avatar: 'AS', image: 'https://images.unsplash.com/photo-1594761051903-2093d5dc2338?w=600&q=80' },
    { name: 'Hill Spice Garden', farmer: 'Maya Krishnan', location: 'Kerala', rating: 4.8, products: 26, specialty: 'Spices & Herbs', avatar: 'MK', image: 'https://images.unsplash.com/photo-1596040033189-25de5e440f01?w=600&q=80' },
  ];

  const visibleCount = 3;
  const maxIndex = Math.max(0, farmers.length - visibleCount);

  return (
    <section className="section bg-neutral-50" id="featured-farmers" ref={ref}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="flex items-end justify-between mb-12">
          <div>
            <span className="badge badge-sky mb-4 inline-flex">Featured Farmers</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
              Meet Our <span className="gradient-text">Top Farmers</span>
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-white hover:shadow disabled:opacity-30 transition-all" id="farmers-prev">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrent(Math.min(maxIndex, current + 1))} disabled={current >= maxIndex} className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-white hover:shadow disabled:opacity-30 transition-all" id="farmers-next">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="overflow-hidden">
          <motion.div className="flex gap-6" animate={{ x: `-${current * (100 / visibleCount + 2)}%` }} transition={{ type: 'spring', stiffness: 200, damping: 30 }}>
            {farmers.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="min-w-[calc(33.333%-1rem)] max-lg:min-w-[calc(50%-0.75rem)] max-sm:min-w-full"
              >
                <Link to={`/farmers/${i + 1}`} className="card group block">
                  <div className="relative h-48 overflow-hidden">
                    <img src={f.image} alt={f.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{f.name}</h3>
                      <p className="text-white/80 text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {f.location}</p>
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-bold flex items-center gap-1 text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {f.rating}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">{f.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">{f.farmer}</p>
                        <p className="text-xs text-neutral-500">{f.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">{f.products} products</span>
                      <span className="text-sky-600 font-semibold group-hover:underline">View Farm →</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// =============== DELIVERY PROCESS ===============
function DeliveryProcessSection() {
  const { ref, inView } = useInViewHook({ triggerOnce: true, threshold: 0.2 });

  const stages = [
    { icon: '🧑‍🌾', label: 'Farmer Harvests', desc: 'Your order triggers fresh harvest', time: '0 min' },
    { icon: '📦', label: 'Packed with Care', desc: 'Quality checked and packed', time: '15 min' },
    { icon: '🛵', label: 'On the Way', desc: 'Delivery partner picks up', time: '30 min' },
    { icon: '🏠', label: 'At Your Door', desc: 'Fresh produce delivered!', time: '< 2 hrs' },
  ];

  return (
    <section className="section bg-white" id="delivery-process" ref={ref}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
          <span className="badge badge-green mb-4 inline-flex">Delivery</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            From Farm to You in <span className="gradient-text">Under 2 Hours</span>
          </h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="hidden md:block absolute top-24 left-[10%] right-[10%] h-1 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-full"
              initial={{ width: '0%' }}
              animate={inView ? { width: '100%' } : {}}
              transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {stages.map((stage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.3 }}
                className="text-center"
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white border-2 border-neutral-100 shadow-lg flex items-center justify-center text-4xl relative z-10"
                  animate={inView ? { scale: [0.8, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.3 }}
                >
                  {stage.icon}
                </motion.div>
                <h4 className="font-bold text-neutral-900 mb-1">{stage.label}</h4>
                <p className="text-sm text-neutral-500 mb-2">{stage.desc}</p>
                <span className="badge badge-sky text-[10px]">{stage.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============== MAIN LANDING PAGE ===============
export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <HowItWorksSection />
      <CategoriesSection />
      <FeaturedFarmersSection />
      <WhySection />
      <DeliveryProcessSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
