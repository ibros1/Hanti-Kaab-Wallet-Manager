import React, { useState } from "react";
import SideBar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import { Outlet } from "react-router";
import Footer from "../components/layout/Footer";

const MainPage = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  console.log(isSideBarOpen);
  return (
    <div className="flex flex-col ">
      {isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}
      {/* sideBar */}
      <div className="">
        <div
          className={`
          fixed top-0 left-0 h-full w-96 lg:w-80 bg-white z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 
          ${isSideBarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <SideBar setIsSideBarOpen={setIsSideBarOpen} />
        </div>

        <div className={`flex flex-col lg:pl-80 mx-auto  w-full  `}>
          <Header
            isSideBarOpen={isSideBarOpen}
            setIsSideBarOpen={setIsSideBarOpen}
          />
          <main
            className="flex-1 min-h-screen px-6"
            onClick={() => setIsSideBarOpen(false)}
          >
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
