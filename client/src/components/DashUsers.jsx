import { Modal, Table, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/user/getusers`, {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`, 
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUsers(data.users);
          setShowMore(data.users.length >= 9);
        } else {
          console.log("❌ Fetch error:", data.message);
        }
      } catch (error) {
        console.log("🔥 Fetching error:", error.message);
      }
    };

    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser?._id]);

  // ✅ Fungsi Hapus User
  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ User deleted successfully!");
        setUsers(users.filter((user) => user._id !== userIdToDelete));
        setShowModal(false);
      } else {
        alert("❌ Delete error:", data.message);
      }
    } catch (error) {
      alert("🔥 Error deleting user:", error.message);
    }
  };

  return (
    <div className="p-3">
      {currentUser?.role === "admin" && users.length > 0 ? (
        <>
          <Table>
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>User Image</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Admin</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {users.map((user) => (
              <Table.Body key={user._id}>
                <Table.Row>
                  <Table.Cell>{new Date(user.createdAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <img src={user.profilePicture} alt={user.username} className="w-10 h-10 rounded-full" />
                  </Table.Cell>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.role === "admin" ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}</Table.Cell>
                  <Table.Cell>
                    <button
                      className="text-red-500"
                      onClick={() => {
                        setUserIdToDelete(user._id);
                        setShowModal(true);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>

          {/* Modal Konfirmasi Hapus */}
          {showModal && (
            <Modal show={showModal} onClose={() => setShowModal(false)}>
              <Modal.Header>Delete User</Modal.Header>
              <Modal.Body>
                <div className="flex items-center gap-2">
                  <HiOutlineExclamationCircle className="text-red-500" size={30} />
                  <p>Are you sure you want to delete this user?</p>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button color="red" onClick={handleDeleteUser}>Delete</Button>
                <Button onClick={() => setShowModal(false)}>Cancel</Button>
              </Modal.Footer>
            </Modal>
          )}
        </>
      ) : (
        <p>No users found!</p>
      )}
    </div>
  );
}
