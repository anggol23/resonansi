import { Link } from "react-router-dom";
import CallToAction from "../components/CallToAction";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { Carousel } from "flowbite-react";

// Image Home
import slide1 from "../assets/slide_photo/IBH.jpg";
import slide2 from "../assets/slide_photo/Merdeka.jpg";
import slide3 from "../assets/slide_photo/PanggungharjoGor.jpg";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("/api/post/getPosts");
      const data = await res.json();
      setPosts(data.posts);
    };
    fetchPosts();
  }, []);
  return (
    <div>
      <div className="h-56 sm:h-64 xl:h-80 2xl:h-96 rounded-lg overflow-hidden shadow-lg">
        <Carousel slide={false} className="w-full h-full">
          <img
            src={slide1}
            alt="First slide"
            className="w-full h-full object-cover"
          />
          <img
            src={slide2}
            alt="Second slide"
            className="w-full h-full object-cover"
          />
          <img
            src={slide3}
            alt="Third slide"
            className="w-full h-full object-cover"
          />
        </Carousel>
      </div>
      <div className="p-3 bg-amber-100 dark:bg-slate-700">
        <CallToAction />
      </div>

      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        {posts && posts.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-center">Recent Posts</h2>
            <div className="flex flex-wrap gap-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link
              to={"/search"}
              className="text-lg text-teal-500 hover:underline text-center"
            >
              View all posts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
