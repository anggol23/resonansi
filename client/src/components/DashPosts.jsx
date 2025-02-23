import { Modal, Table, Button, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Current User:", currentUser); // ✅ Debugging user data

    if (!currentUser || !currentUser._id || currentUser.role !== "admin") {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/post/getposts?userId=${currentUser._id}`);
        const data = await res.json();

        console.log("API Response:", res, data); // ✅ Debug API response

        if (res.ok) {
          setUserPosts(data.posts);
          setShowMore(data.posts.length >= 9);
        } else {
          throw new Error(data.message || "Failed to fetch posts");
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [currentUser]);

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3">
      {loading ? (
        <div className="flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : userPosts.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Post image</Table.HeadCell>
              <Table.HeadCell>Post title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>Edit</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {userPosts.map((post) => (
                <Table.Row key={post._id} className="bg-white dark:bg-gray-800">
                  <Table.Cell>{new Date(post.updatedAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Link to={`/post/${post.slug}`}>
                      <img src={post.image} alt={post.title} className="w-20 h-10 object-cover" />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link className="font-medium text-gray-900 dark:text-white" to={`/post/${post.slug}`}>
                      {post.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{post.category}</Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setPostIdToDelete(post._id);
                      }}
                      className="font-medium text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link className="text-teal-500 hover:underline" to={`/update-post/${post._id}`}>
                      Edit
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      ) : (
        <p className="text-center text-gray-500">You have no posts yet!</p>
      )}
    </div>
  );
}
