import React from "react";

export default function Certificate({ name, score, total, date }) {
  return (
    <div className="w-[1000px] h-[700px] bg-white border-8 border-yellow-600 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-10 font-serif mx-auto">
      {/* Top Logos */}
      <div className="w-full flex justify-between items-center px-16">
        <img
          src="./club-logo.jpg"
          alt="Club Logo"
          className="h-28 object-contain"
        />
        <img
          src="./college-logo.png"
          alt="College Logo"
          className="h-28 object-contain"
        />
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold text-yellow-700 mt-6 mb-2 uppercase">
        Certificate of Achievement
      </h1>
      <p className="text-lg text-gray-600 mb-8 italic">
        Voices and Minds United
      </p>

      {/* Main Content */}
      <div className="text-center px-12">
        <p className="text-2xl mb-4">This is proudly presented to</p>
        <h2 className="text-4xl font-bold text-gray-900 underline decoration-yellow-500 decoration-4 mb-6">
          {name}
        </h2>
        <p className="text-xl text-gray-700 mb-4">
          For outstanding performance in the <b>Debate & Quiz Club</b>
        </p>
        <p className="text-xl text-gray-700 mb-6">
          Score: <b>{score}</b> out of <b>{total}</b>
        </p>
      </div>

      {/* Footer - Only Date */}
      <div className="flex justify-center w-full px-16 mt-12">
        <div className="text-center">
          <p className="text-lg font-semibold">Date</p>
          <p className="text-gray-700">{date}</p>
        </div>
      </div>
    </div>
  );
}

{
  /* <Certificate name="John Doe" score={18} total={20} date="Aug 16, 2025" />; */
}
