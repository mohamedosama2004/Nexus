import Logo from "./Logo";
import NavigationLinks from "./NavigationLinks";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gray-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <NavigationLinks />
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
