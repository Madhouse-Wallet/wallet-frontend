import { useEffect, useState } from "react";

export default function CustomToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger entry animation
    setShow(true);

    // Auto-close after 3s
    const timer = setTimeout(() => {
      setShow(false); // Start exit animation
      setTimeout(onClose, 300); // Wait for animation to end
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-end justify-start h-full w-full fixed bottom-0 left-0 z-[9999] p-4">
      {/* <div className="fixed bg-black/50 top-0 left-0 h-lvh w-full transition-opacity fill-mode-both opacity-100 pointer-events-none inset-0 scale-125 object-cover object-center blur-[var(--wallpaper-blur)] duration-700 backdrop-blur-md z-[-1]"></div> */}

      <div
        className={`transform  px-4 py-3 rounded-lg shadow-lg text-white bg-black/90 text-xs transition-all duration-300 ease-in-out z-[99999] ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
