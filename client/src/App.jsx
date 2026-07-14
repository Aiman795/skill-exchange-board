import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom"; // 👈 Only import ONCE
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import Navbar from "./components/Navbar";
import BrowseListings from "./pages/BrowseListings"; // This should work with .jsx

import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/browse" element={<BrowseListings />} />

        {/* Home page */}
        <Route
          path="/"
          element={
            <>
              <section id="center">
                <div className="hero">
                  <img
                    src={heroImg}
                    className="base"
                    width="170"
                    height="179"
                    alt=""
                  />
                </div>

                <p
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <Link to="/signup">Sign Up</Link>
                  <span>|</span>
                  <Link to="/login">Login</Link>
                  <span>|</span>
                  <Link to="/create-listing">Create Listing</Link>
                  <span>|</span>
                  <Link to="/browse">Browse Listings</Link>{" "}
                  {/* 👈 Added browse link */}
                </p>
              </section>
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
