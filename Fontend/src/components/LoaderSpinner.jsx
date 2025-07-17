import { ThreeDots } from "react-loader-spinner";

export default function LoaderSpinner({ text = "กำลังโหลด..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/30 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4 p-6 rounded-lg">
        <ThreeDots
          visible={true}
          height="80"
          width="80"
          color="#FDC900" 
          radius="9"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
        <p className="text-gray-900 text-4xl font-semibold">{text}</p>
      </div>
    </div>
  );
}