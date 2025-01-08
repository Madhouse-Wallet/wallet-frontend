import React from "react";

const Loader = () => {
  return (
    <>
      <div
        className="position-fixed h-100 w-100 d-flex align-items-center justify-content-center"
        style={{ height: "100vh", background: "#000000d6", zIndex: 9999 }}
      >
        {/* <img
          src="./loading.gif"
          alt=""
          className="img-fluid object-contain"
          style={{ height: 40 }}
        /> */}
      </div>
    </>
  );
};

export default Loader;
