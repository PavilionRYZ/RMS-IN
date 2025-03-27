const Header = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0 z-50">
     {/* design the left sideabr menu based on user role and permissions and also provide the logout functionality*/}
     <div className="flex items-center">
      <div className="text-xl font-bold">RestroMaster</div>
     </div>
    </nav>
  );
};
;

export default Header;
