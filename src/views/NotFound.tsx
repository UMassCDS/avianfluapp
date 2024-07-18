import { Link } from 'react-router-dom';
// Simply returns a not found page if a user types an invalid url 
function NotFound() {
  return (
    <div className="NotFound">
      <h1>404 Page Not Found</h1>
      <Link to="/"> GO HOME </Link>
    </div>
  );
}

export default NotFound;
