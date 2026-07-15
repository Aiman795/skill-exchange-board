import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import heroImg from "./assets/hero.png";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import Navbar from "./components/Navbar";
import BrowseListings from "./pages/BrowseListings";
import MyMatches from "./pages/MyMatches";
import ViewProfile from "./pages/ViewProfile";
import Chat from "./pages/Chat";
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
        <Route path="/my-matches" element={<MyMatches />} />
        <Route path="/chat/:otherUserId" element={<Chat />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/view-profile/:userId" element={<ViewProfile />} />

        {/* Home page */}
        <Route
          path="/"
          element={
            <main id="center" className="hero-container">
              <div className="hero-graphic">
                <img src={heroImg} className="base" alt="Platform Hero Visual" />
                <div className="glow-effect"></div>
              </div>

              <div className="welcome-text">
                <h1>Find Your Perfect Connection</h1>
                <p>Browse listings, find matches, and start chatting instantly.</p>
              </div>

              <div className="action-grid">
                <Link to="/browse" className="btn btn-primary">Browse Listings</Link>
                <Link to="/my-matches" className="btn btn-secondary">My Matches</Link>
                <Link to="/create-listing" className="btn btn-secondary">Create Listing</Link>
              </div>

              <div className="auth-footer">
                <span>New here? <Link to="/signup">Sign Up</Link></span>
                <span className="dot">•</span>
                <span>Already have an account? <Link to="/login">Login</Link></span>
              </div>
            </main>
          }
        />
      </Routes>
    </>
  );
}

export default App;