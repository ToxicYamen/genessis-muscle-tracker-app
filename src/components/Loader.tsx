
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Loader = () => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Initial setup
    gsap.set([logoRef.current, textRef.current], { opacity: 0, y: 50 });
    gsap.set(orbsRef.current?.children, { scale: 0, rotation: 0 });
    gsap.set(progressBarRef.current, { width: "0%" });
    
    // Main animation sequence
    tl.to(logoRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out"
    })
    .to(orbsRef.current?.children, {
      scale: 1,
      rotation: 360,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.out(1.7)"
    }, "-=0.5")
    .to(logoRef.current, {
      scale: 1.1,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    })
    .to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.5")
    .to(progressBarRef.current, {
      width: "100%",
      duration: 2,
      ease: "power2.inOut"
    }, "-=0.3")
    .to(loaderRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power3.in",
      delay: 0.5
    });

    // Floating animation for orbs
    gsap.to(orbsRef.current?.children, {
      y: -20,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
      stagger: 0.2,
      delay: 1
    });

    // Rotation animation for main logo
    gsap.to(logoRef.current?.querySelector('.logo-inner'), {
      rotation: 360,
      duration: 8,
      repeat: -1,
      ease: "none",
      delay: 1
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div 
      ref={loaderRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/10 backdrop-blur-sm"
    >
      <div className="text-center relative">
        {/* Floating Orbs */}
        <div ref={orbsRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-4 h-4 bg-primary/30 rounded-full blur-sm"></div>
          <div className="absolute -top-10 right-10 w-3 h-3 bg-blue-400/40 rounded-full blur-sm"></div>
          <div className="absolute top-20 -right-20 w-5 h-5 bg-purple-400/30 rounded-full blur-sm"></div>
          <div className="absolute bottom-10 -left-10 w-2 h-2 bg-green-400/40 rounded-full blur-sm"></div>
          <div className="absolute -bottom-20 right-20 w-6 h-6 bg-orange-400/20 rounded-full blur-sm"></div>
        </div>

        {/* Main Logo */}
        <div ref={logoRef} className="mb-8 relative">
          <div className="w-32 h-32 mx-auto relative">
            {/* Outer Ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
            
            {/* Middle Ring */}
            <div className="absolute inset-4 bg-gradient-to-r from-blue-400 via-primary to-purple-400 rounded-full opacity-30 logo-inner"></div>
            
            {/* Inner Core */}
            <div className="absolute inset-8 bg-gradient-to-r from-primary to-blue-400 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-white drop-shadow-lg">G4</span>
            </div>
            
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 rounded-full opacity-10 blur-xl animate-pulse"></div>
          </div>
        </div>
        
        {/* Text Content */}
        <div ref={textRef} className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
            GENESIS 4
          </h1>
          <p className="text-muted-foreground text-lg">
            Lade deine Transformation...
          </p>
          
          {/* Progress Bar */}
          <div className="w-64 h-2 bg-secondary/30 rounded-full mx-auto overflow-hidden">
            <div 
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-primary via-blue-400 to-purple-400 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
            </div>
          </div>
          
          {/* Loading Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.5s'
                }}
              ></div>
            ))}
          </div>
          
          {/* Subtitle */}
          <p className="text-sm text-muted-foreground/70 mt-4">
            Bereite dich auf deine 4-Jahres-Transformation vor
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
