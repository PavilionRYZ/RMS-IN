import { useState } from "react";
import { motion } from "framer-motion";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuVariants = {
    open: {
      left: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    closed: {
      left: "-100%",
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { x: 150, opacity: 0 },
    visible: (i) => ({ x: 0, opacity: 1, transition: { delay: i * 0.2 } }),
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-4 items-center p-4 bg-gray-900 text-white">
        <RiMenu3Line
          className="text-3xl cursor-pointer"
          onClick={() => setIsOpen(true)}
        />
        <h1 className="text-2xl font-bold">RMS-IN</h1>
      </div>
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={menuVariants}
        className="fixed top-0 left-[-100%] w-1/5 h-full bg-gray-800 text-white flex flex-col justify-center items-center space-y-6"
      >
        {["Dashboard", "Menu", "inventory", "Contact"].map((text, i) => (
          <motion.h4
            key={text}
            custom={i}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            variants={itemVariants}
            className="text-xl cursor-pointer"
          >
            {text}
          </motion.h4>
        ))}
        <RiCloseLine
          className="absolute top-4 right-4 text-3xl cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
      </motion.div>
    </div>
  );
};

export default Header;
