import { useRouter } from "next/router";

const Room = () => {
  const router = useRouter();
  const { name } = router.query;

  return <div>Hello {name}</div>;
};

export default Room;
