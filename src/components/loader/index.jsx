import React from "react";
import Image from "next/image";

const Loader = () => {
  return (
    <>
      <div
        className="fixed h-full w-full flex items-center justify-center top-0 left-0"
        style={{ height: "100vh", background: "#000000a3", zIndex: 9999 }}
      >
        <Image
          src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
          alt={""}
          height={100000}
          width={10000}
          className={"max-w-full h-[40px] object-contain w-auto"}
        />
      </div>
    </>
  );
};

export default Loader;
