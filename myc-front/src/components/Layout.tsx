import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
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
  console.log(user);
  return (
    <>
      <header>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/login">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Login
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem className="cursor-pointer" onClick={onLogOut}>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Logout
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      {children}
    </>
  );
}
