import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <div>
      <h1>Implementations</h1>

      <p>
        <Link to="/content-editable">Content Editable</Link>
      </p>
    </div>
  );
};

export default Home;
