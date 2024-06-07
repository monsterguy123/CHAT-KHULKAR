import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-700 p-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-white text-3xl font-semibold">CHAT KHULKAR</h1>
          </div>
          <div className="hidden sm:block">
            <div className="flex space-x-6 text-white">
              <Link
                to="/"
                className="hover:text-purple-200 text-xl transition duration-300"
              >
                Rooms
              </Link>
              <Link
                to="/createroom"
                className="hover:text-purple-200 text-xl transition duration-300"
              >
                Create Room
              </Link>
              <Link
                to="/friends"
                className="hover:text-purple-200 text-xl transition duration-300"
              >
                Friends
              </Link>
              <Link
                to="/notifications"
                className="hover:text-purple-200 text-xl transition duration-300"
              >
                Notifications
              </Link>
              <Link
                to="/signin"
                className="hover:text-purple-200 text-xl transition duration-300"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
