import Link from "next/link";
import { useState } from "react";

const LandingPage = () => {
  const [name, setName] = useState("");
  const handleNameChange = (e: any) => {
    setName(e.target.value);
  };
  return (
    <div>
      <label>Name: </label>
      <input
        type="text"
        className="border-2 border-black"
        onChange={handleNameChange}
      />

      <Link
        href={`/room/${name}`}
        className="border-2 border-black"
        onClick={() => {
          //join room logic here
        }}
      >
        Submit
      </Link>
    </div>
  );
};

export default LandingPage;
