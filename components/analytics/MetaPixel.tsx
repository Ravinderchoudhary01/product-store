// "use client";

// import { useEffect } from "react";

// declare global {
//   interface Window {
//     fbq?: (...args: any[]) => void;
//     _fbq?: any;
//   }
// }

// export default function MetaPixel() {
//   useEffect(() => {
//     if (window.fbq) return;

//     const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

//     if (!pixelId) {
//       console.warn("Meta Pixel ID is missing");
//       return;
//     }

//     const fbq = function (...args: any[]) {
//       (fbq as any).queue = (fbq as any).queue || [];
//       (fbq as any).queue.push(args);
//     };

//     (window as any).fbq = fbq;
//     window._fbq = fbq;

//     const script = document.createElement("script");

//     script.async = true;
//     script.src = "https://connect.facebook.net/en_US/fbevents.js";

//     document.head.appendChild(script);

//     fbq("init", pixelId);
//     fbq("track", "PageView");
//   }, []);

//   return null;
// }

"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export default function MetaPixel() {
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

    console.log("META PIXEL ID:", pixelId);

    if (!pixelId) {
      console.error("META PIXEL ID IS MISSING");
      return;
    }

    if (window.fbq) {
      return;
    }

    const fbq = function (...args: any[]) {
      fbq.callMethod
        ? fbq.callMethod.apply(fbq, args)
        : fbq.queue.push(args);
    } as any;

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];

    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");

    script.async = true;
    script.src =
      "https://connect.facebook.net/en_US/fbevents.js";

    document.head.appendChild(script);

    fbq("init", pixelId);
    fbq("track", "PageView");

    console.log("META PIXEL INITIALIZED");
  }, []);

  return null;
}