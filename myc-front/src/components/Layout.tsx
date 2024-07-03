import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const onLogOut = async () => {
    const ok = window.confirm("Are you sure you want to log out?");
    if (ok) {
      await auth.signOut();
      navigate("/login");
    }
  };
  const user = auth.currentUser;
  return (
    <>
      <header>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/">Home</NavigationMenuLink>
              <NavigationMenuLink href="/profile">Profile</NavigationMenuLink>
              <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <nav>
          <ul className="flex">
            <li className="mr-6">
              <Link className="text-blue-500 hover:text-blue-800" to="/">
                Home
              </Link>
            </li>
            <li className="mr-6">
              <Link className="text-blue-500 hover:text-blue-800" to="/profile">
                Profile
              </Link>
            </li>
            <li className="mr-6">
              <span className="text-blue-500 hover:text-blue-800">
                {user?.displayName}
              </span>
            </li>
            <li className="mr-6">
              <Link className="text-blue-500 hover:text-blue-800" to="/login">
                Login
              </Link>
            </li>
            <li className="mr-6">
              <span
                className="text-blue-500 hover:text-blue-800 cursor-pointer"
                onClick={onLogOut}
              >
                Logout
              </span>
            </li>
          </ul>
        </nav>
      </header>
      {children}
    </>
  );
}
