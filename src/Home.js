import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div>
      <h1>Implementations</h1>

      <p>
        <Link to="/textarea-widget">Textarea Widget</Link>
      </p>
      <p>
        <Link to="/editable-div-widget">Editable div widget</Link>
      </p>
    </div>
  );
};

export default Home;
