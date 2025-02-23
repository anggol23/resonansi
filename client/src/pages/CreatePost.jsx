import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useState, useEffect } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    image: "",
  });
  const [publishError, setPublishError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🚀 Cek apakah user adalah admin
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token"); // ✅ Ambil token dari localStorage
  
      if (!token) {
        console.error("🚨 No token found, redirecting...");
        navigate("/"); // Redirect jika tidak ada token
        return;
      }
  
      try {
        const res = await fetch("http://localhost:3000/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Kirim token dalam request header
          },
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          throw new Error(data.message || "Unauthorized");
        }
  
        if (data.role !== "admin") {
          console.warn("⛔ User is not admin, redirecting...");
          navigate("/"); // Redirect jika bukan admin
          return;
        }
  
        setUser(data);
      } catch (error) {
        console.error("🔴 Fetch user error:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [navigate]);
  

  const handleUploadImage = async () => {
    if (!file) {
      setImageUploadError("Please select an image");
      return;
    }

    setImageUploadError(null);
    setUploading(true);

    const storage = getStorage(app);
    const fileName = new Date().getTime() + "-" + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageUploadError("Image upload failed");
        setImageUploadProgress(null);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData({ ...formData, image: downloadURL });
        setImageUploadProgress(null);
        setImageUploadError(null);
        setUploading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.content || !formData.image) {
      setPublishError("Please fill in all fields and upload an image");
      return;
    }

    try {
      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, author: user._id }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message || "Failed to publish post");
        return;
      }

      setPublishError(null);
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError("Something went wrong");
      console.log(error);
    }
  };

  if (loading) return <div className="text-center text-lg font-semibold">Loading...</div>;

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Create a Post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select
            required
            defaultValue=""
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="pendidikan">Pendidikan</option>
            <option value="sosial">Sosial</option>
            <option value="ekonomi">Ekonomi</option>
            <option value="politik">Politik</option>
          </Select>
        </div>

        <div className="flex gap-4 items-center justify-between border-4 border-red-500 border-dotted p-3">
          <FileInput type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <Button
            type="button"
            gradientMonochrome="failure"
            size="sm"
            outline
            onClick={handleUploadImage}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>

        {imageUploadProgress && (
          <div className="w-16 h-16">
            <CircularProgressbar value={imageUploadProgress} text={`${imageUploadProgress || 0}%`} />
          </div>
        )}
        
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}

        {formData.image && <img src={formData.image} alt="upload" className="w-full h-72 object-cover" />}

        <ReactQuill
          theme="snow"
          placeholder="Write something..."
          className="h-72 mb-12"
          required
          value={formData.content}
          onChange={(value) => setFormData({ ...formData, content: value })}
        />

        <Button type="submit" gradientMonochrome="failure" disabled={uploading || !formData.image}>
          {uploading ? "Uploading image..." : "Publish"}
        </Button>

        {publishError && <Alert className="mt-5" color="failure">{publishError}</Alert>}
      </form>
    </div>
  );
}
