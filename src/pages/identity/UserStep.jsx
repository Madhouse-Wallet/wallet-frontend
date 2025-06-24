import React from "react";

const UserStep = ({ step, setStep }) => {
  return (
    <>
      <div className="formWrpper mx-auto max-w-[700px] mt-5 bg-black/50 rounded-20 p-5 md:p-8">
        <div className="pb-4">
          <h4 className="m-0 themeClr text-[28px] font-semibold">
            Almost there
          </h4>
          <p className="m-0 text-xs">
            We need just a few more details before connecting you in...
          </p>
        </div>
        <form className="mt-5">
          <div className="grid gap-3 grid-cols-12">
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="accountName"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Business Name
              </label>
              <input
                id="accountName"
                type="text"
                // value={formData.accountName}
                // onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 
                `}
                placeholder="Enter Business Name"
              />
              {/* {errors.accountName && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.accountName}
                </p>
              )} */}
            </div>
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="accountName"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Street Address
              </label>
              <input
                id="accountName"
                type="text"
                // value={formData.accountName}
                // onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 
                `}
                placeholder="Enter Street Address"
              />
              {/* {errors.accountName && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.accountName}
                </p>
              )} */}
            </div>
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="accountName"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                City
              </label>
              <input
                id="accountName"
                type="text"
                // value={formData.accountName}
                // onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 
                `}
                placeholder="Enter City"
              />
              {/* {errors.accountName && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.accountName}
                </p>
              )} */}
            </div>
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="accountName"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                State
              </label>
              <input
                id="accountName"
                type="text"
                // value={formData.accountName}
                // onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 
                `}
                placeholder="Enter State"
              />
              {/* {errors.accountName && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.accountName}
                </p>
              )} */}
            </div>
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="accountName"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Country
              </label>
              <input
                id="accountName"
                type="text"
                // value={formData.accountName}
                // onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 
                `}
                placeholder="Enter Country"
              />
              {/* {errors.accountName && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.accountName}
                </p>
              )} */}
            </div>
            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="accountName"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Registered Type
              </label>
              <input
                id="accountName"
                type="text"
                // value={formData.accountName}
                // onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 
                `}
                placeholder="Enter Registered Type"
              />
              {/* {errors.accountName && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.accountName}
                </p>
              )} */}
            </div>

            <div className="md:col-span-6 col-span-12">
              <label
                htmlFor="accountName"
                className="form-label m-0 font-medium text-[12px] pl-3 pb-1"
              >
                Registered Value
              </label>
              <input
                id="accountName"
                type="text"
                // value={formData.accountName}
                // onChange={handleChange}
                className={`border-white/10 bg-white/4 hover:bg-white/6 focus-visible:placeholder:text-white/40 text-white/40 focus-visible:text-white focus-visible:border-white/50 focus-visible:bg-white/10 placeholder:text-white/30 flex text-xs w-full border-px md:border-hpx px-5 py-2 text-15 font-medium -tracking-1 transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 h-12 rounded-full pr-11 
                `}
                placeholder="Enter Registered Value"
              />
              {/* {errors.accountName && (
                <p className="text-red-500 text-xs mt-1 pl-3">
                  {errors.accountName}
                </p>
              )} */}
            </div>
          </div>

          <div className="py-4 mt-10">
            <div className="flex items-center justify-center">
              <button
                // onClick={handleContinue}
                type="submit"
                // disabled={isLoading}
                className="commonBtn hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50"
              >
                Submit
                {/* {isLoading ? "Processing..." : "Continue"} */}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserStep;
