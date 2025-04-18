import React from "react";
import Image from "next/image";
import logo from "@/Assets/Images/logow1.png";

const Sidebar = ({ tab, setTab, tabData }) => {
  const handleTab = (activeTab) => {
    setTab(activeTab);
  };
  return (
    <>
      <div className="sidebar border-r border-black/50 h-[calc(100vh-200px)] overflow-auto p-5 bg-black/50 rounded-xl">
        <div className="top py-3 mb-5 border-b border-white/50">
          <Image
            src={logo}
            alt="logo"
            className="max-w-full h-[30px] w-auto mx-auto"
            height={10000}
            width={10000}
          />
        </div>
        <div className="content">
          <ul className="list-none pl-0 mb-0">
            {tabData.map((item, key) => (
              <li key={key} className="py-2">
                <button
                  onClick={() => handleTab(key)}
                  className={`${tab == key && "bg-[#df723b]"} w-full rounded-full flex items-center gap-2 text-xs font-medium py-2 px-3 rounded`}
                >
                  <span className="icn">{item.icn}</span>
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
