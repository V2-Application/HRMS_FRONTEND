import React from 'react';
import { useNavigate } from 'react-router-dom';
import astronaunt_gif from '../../../assets/images/astronaunt.gif';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404 - Page Not Found</h1>
      <img src={astronaunt_gif} alt="Astronaut floating" style={styles.image} />
      <p style={styles.text}>
        Oops! It seems like you've drifted into space.
      </p>
      {/* <button onClick={() => navigate('/')} style={styles.button}>
        Go Back Home
      </button> */}
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    backgroundColor: '#0e1a2b',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px',
  },
  heading: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  image: {
    width: '250px',
    marginBottom: '20px',
  },
  text: {
    fontSize: '18px',
    marginBottom: '30px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#1e90ff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#fff',
  },
};

export default NotFoundPage;
