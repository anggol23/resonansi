import { Sidebar } from "flowbite-react";
import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
} from "react-icons/hi";
import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  // ✅ Ambil tab dari URL secara otomatis
  const tab = useMemo(() => {
    return new URLSearchParams(location.search).get("tab") || "dash";
  }, [location.search]);

  // ✅ Fungsi sign out dengan error handling
  const handleSignout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/signout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch(signoutSuccess());
    } catch (error) {
      console.error("❌ Sign out error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          {/* ✅ Dashboard hanya untuk Admin */}
          {currentUser?.role === "admin" && (
            <Sidebar.Item as={Link} to="/dashboard?tab=dash" active={tab === "dash"} icon={HiChartPie}>
              Dashboard
            </Sidebar.Item>
          )}

          {/* ✅ Profile */}
          <Sidebar.Item as={Link} to="/dashboard?tab=profile" active={tab === "profile"} icon={HiUser} label={currentUser?.role === "admin" ? "Admin" : "User"} labelColor="dark">
            Profile
          </Sidebar.Item>

          {/* ✅ Posts hanya untuk Admin */}
          {currentUser?.role === "admin" && (
            <Sidebar.Item as={Link} to="/dashboard?tab=posts" active={tab === "posts"} icon={HiDocumentText}>
              Posts
            </Sidebar.Item>
          )}

          {/* ✅ Users & Comments hanya untuk Admin */}
          {currentUser?.role === "admin" && (
            <>
              <Sidebar.Item as={Link} to="/dashboard?tab=users" active={tab === "users"} icon={HiOutlineUserGroup}>
                Users
              </Sidebar.Item>
              <Sidebar.Item as={Link} to="/dashboard?tab=comments" active={tab === "comments"} icon={HiAnnotation}>
                Comments
              </Sidebar.Item>
            </>
          )}

          {/* ✅ Tombol Sign Out */}
          <Sidebar.Item icon={HiArrowSmRight} className={`cursor-pointer ${loading ? "opacity-50" : ""}`} onClick={!loading ? handleSignout : undefined}>
            {loading ? "Signing out..." : "Sign Out"}
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
