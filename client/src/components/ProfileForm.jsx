import { useState, useEffect } from "react";

export default function ProfileForm({ user, onSave }) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  // Unifies both variations in state
  const [location, setLocation] = useState(user?.location || user?.city || ""); 
  const [photoFile, setPhotoFile] = useState(null);
  
  // Checks if photoUrl already starts with /uploads
  const initialPreview = user?.photoUrl 
    ? (user.photoUrl.startsWith('http') ? user.photoUrl : `http://localhost:5000${user.photoUrl}`) 
    : "";
  const [preview, setPreview] = useState(initialPreview);
  const [saving, setSaving] = useState(false);

  // Keep state synced with prop changes 
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setLocation(user.location || user.city || "");
      if (user.photoUrl) {
        setPreview(user.photoUrl.startsWith('http') ? user.photoUrl : `http://localhost:5000${user.photoUrl}`);
      }
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    // Send under BOTH keys so it works regardless of which field name
    // the backend update route actually reads (location vs city).
    // Once you confirm which one the backend expects, you can drop the other.
    formData.append("location", location);
    formData.append("city", location);
    if (photoFile) formData.append("photo", photoFile);

    try {
      await onSave(formData);
    } catch (err) {
      console.error("Failed to submit form data", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "420px" }}>
      <h2>Edit Profile</h2>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0.5rem" }}>
        {preview ? (
          <img
            src={preview}
            alt="Profile preview"
            style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: "0.5rem" }}
          />
        ) : (
          <div
            style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "#e0e0e0", marginBottom: "0.5rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#888", fontSize: "0.8rem",
            }}
          >
            No photo
          </div>
        )}
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>

      <label>Name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

      <label>Location</label>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="e.g. Rawalpindi, Punjab"
      />

      <label>Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={300}
        rows={4}
        style={{ padding: "0.6rem", marginTop: "0.25rem", border: "1px solid #ccc", borderRadius: "6px", fontFamily: "inherit", width: "100%" }}
      />
      <p style={{ fontSize: "0.75rem", color: "#888", textAlign: "right" }}>{bio.length}/300</p>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}