import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#F5EEDC] px-6 py-4 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Copyright - Left */}
        <p className="text-center md:text-left mt-2 md:mt-0">
          © 2025 TopAward. สงวนลิขสิทธิ์
        </p>

        {/* Social Icons - Right */}
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebookF className="text-[#9A6D2B] hover:text-[#7a531f]" size={20} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="text-[#9A6D2B] hover:text-[#7a531f]" size={20} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="text-[#9A6D2B] hover:text-[#7a531f]" size={20} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn className="text-[#9A6D2B] hover:text-[#7a531f]" size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;