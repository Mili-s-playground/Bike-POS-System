import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const OutletSelection = () => {
  const navigate = useNavigate();

  const handleOutletSelect = (outlet) => {
    localStorage.setItem("selectedOutlet", outlet);
    navigate(`/dashboard/${outlet}`);
  };

  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '4rem'
    },
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    headerContainer: {
      background: '#ffffff',
      borderRadius: '15px',
      padding: '2rem 1.5rem',
      marginBottom: '2rem',
      marginTop: '1rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e9ecef',
      textAlign: 'center'
    },
    mainTitle: {
      color: '#2c3e50',
      fontWeight: '700',
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    titleAccent: {
      color: '#f39c12'
    },
    bikeIcon: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      color: '#f39c12'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: 'clamp(1rem, 3vw, 1.3rem)',
      fontWeight: '400',
      margin: 0
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '3.5rem',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    outletCard: {
      background: '#ffffff',
      borderRadius: '15px',
      border: '1px solid #e9ecef',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      cursor: 'pointer'
    },
    cardBody: {
      padding: '2rem 1.5rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '350px'
    },
    iconContainer: {
      marginBottom: '1.5rem',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100px'
    },
    iconBackground: {
      position: 'absolute',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      opacity: '0.1'
    },
    shopIcon: {
      fontSize: '3rem',
      position: 'relative',
      zIndex: 1
    },
    cardTitle: {
      color: '#2c3e50',
      fontWeight: '600',
      marginBottom: '1rem',
      fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
      lineHeight: '1.3'
    },
    cardText: {
      color: '#6c757d',
      marginBottom: '2rem',
      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
      flexGrow: 1
    },
    button: {
      border: 'none',
      borderRadius: '10px',
      padding: '1rem 1.5rem',
      fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      color: 'white',
      minHeight: '50px'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #3498db, #2980b9)',
      boxShadow: '0 4px 15px rgba(52, 152, 219, 0.25)'
    },
    successButton: {
      background: 'linear-gradient(135deg, #27ae60, #229954)',
      boxShadow: '0 4px 15px rgba(39, 174, 96, 0.25)'
    }
  };

  return (
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          <div style={styles.headerContainer}>
            <h1 style={styles.mainTitle}>
              <span style={styles.bikeIcon}>🚲</span>
              <span>Bike <span style={styles.titleAccent}>POS</span> System</span>
            </h1>
            <p style={styles.subtitle}>Select your outlet to continue</p>
          </div>

          <div style={styles.cardGrid}>
            <div
                style={styles.outletCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
            >
              <div style={styles.cardBody}>
                <div style={styles.iconContainer}>
                  <div
                      style={{
                        ...styles.iconBackground,
                        background: '#3498db'
                      }}
                  ></div>
                  <div
                      style={{
                        ...styles.shopIcon,
                        color: '#3498db'
                      }}
                  >
                    🏪
                  </div>
                </div>
                <h3 style={styles.cardTitle}>
                  හරිගල | Harigala Outlet
                </h3>
                <p style={styles.cardText}>
                  Main branch location
                </p>
                <button
                    style={{...styles.button, ...styles.primaryButton}}
                    onClick={() => handleOutletSelect("harigala")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.25)';
                    }}
                >
                  <span>➤</span>
                  Enter Harigala | හරිගල
                </button>
              </div>
            </div>

            <div
                style={styles.outletCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
            >
              <div style={styles.cardBody}>
                <div style={styles.iconContainer}>
                  <div
                      style={{
                        ...styles.iconBackground,
                        background: '#27ae60'
                      }}
                  ></div>
                  <div
                      style={{
                        ...styles.shopIcon,
                        color: '#27ae60'
                      }}
                  >
                    🏪
                  </div>
                </div>
                <h3 style={styles.cardTitle}>
                  බලපත්තාව | Arandara Outlet
                </h3>
                <p style={styles.cardText}>
                  Secondary branch location
                </p>
                <button
                    style={{...styles.button, ...styles.successButton}}
                    onClick={() => handleOutletSelect("arandara")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(39, 174, 96, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.25)';
                    }}
                >
                  <span>➤</span>
                  Enter Balpaththawa | බලපත්තාව
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default OutletSelection;