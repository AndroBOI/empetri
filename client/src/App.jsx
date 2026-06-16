import { useEffect, useState } from "react";

const App = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getMessage = async () => {
      const data = await fetch("http://localhost:5000/api/health");
      const res = await data.json();

      setMessage(res.message);
    };

    getMessage();
  }, []);

  return <div className="bg-red-100">{message}</div>;
};

export default App;
