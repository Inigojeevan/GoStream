import { useNavigate } from "react-router";

const CreateRoom = () => {
  const navigate = useNavigate();

  const create = async (e: any) => {
    e.preventDefault();
    const resp = await fetch("http://localhost:8000/createRoom");
    const { room_id } = await resp.json();

    navigate(`/room/${room_id}`, { state: { id: room_id } });
  };

  return (
    <div>
      <button onClick={create}>Create Room</button>
    </div>
  );
};

export default CreateRoom;
