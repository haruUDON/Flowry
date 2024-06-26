import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSnackbar } from './Snackbar';
import styles from "../styles/Login.module.css";


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showSnackbar } = useSnackbar();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleBlur = (e) => {
    const $this = e.target;
    if ($this.value.trim() !== '') {
      $this.classList.add(styles.used);
    } else {
      $this.classList.remove(styles.used);
    }
  };

  const handleRipplesClick = (e) => {
    const $this = e.currentTarget;
    const $offset = $this.parentElement.getBoundingClientRect();
    const $circle = $this.querySelector(`.${styles.ripplesCircle}`);

    const x = e.clientX - $offset.left;
    const y = e.clientY - $offset.top;

    if ($circle) {
      $circle.style.top = y + 'px';
      $circle.style.left = x + 'px';
  
      $this.classList.add(styles.isActive);
  
      setTimeout(() => {
        $this.classList.remove(styles.isActive);
      }, 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message);
      }

      const { success } = data;
      if (success) window.location.reload();
    } catch (err) {
      showSnackbar(err.message);
      setPassword('');
    }
  };

  return (
    <>
      <div className={styles.bodyContainer}>
      <hgroup>
        <h1>Welcome Back!</h1>
        <h3>Animer</h3>
      </hgroup>
      <form onSubmit={handleSubmit}>
        <div className={styles.group}> 
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleBlur}
            required
          /><span className={styles.highlight}></span><span className={styles.bar}></span>
          <label>Email</label>
        </div>
        <div className={styles.group}>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handleBlur}
            required
          /><span className={styles.highlight}></span><span className={styles.bar}></span>
          <label>Password</label>
        </div>
        <button type="submit" className={`${styles.button} ${styles.buttonBlue}`}>
          Login
          <div className={`${styles.ripples} ${styles.buttonRipples}`} onClick={handleRipplesClick}><span className={styles.ripplesCircle}></span></div>
        </button>
        <div className={styles.signup}>
          <span className={styles.message}>Not registered? <Link to="/signup">Create an account</Link></span>
        </div>
      </form>
    </div>
  </>
  );
};

export default Login;