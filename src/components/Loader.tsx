
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Loader = () => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Initial setup
    gsap.set([logoRef.current, textRef.current], { opacity: 0, y: 50 });
    
    // Animation sequence
    tl.to(logoRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out"
    })
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
    .to(loaderRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power3.in",
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
      <div className="text-center">
        <div 
          ref={logoRef}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 rounded-2xl opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-primary to-blue-400 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">G4</span>
            </div>
          </div>
        </div>
        
        <div ref={textRef} className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            GENESIS 4
          </h1>
          <p className="text-muted-foreground">
            Lade deine Transformation...
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
