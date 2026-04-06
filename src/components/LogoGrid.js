import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Cloud, Database, Smartphone, Globe, Activity } from 'lucide-react';

export const LogoGrid = () => {
    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <motion.h3 
                    style={styles.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    TRUSTED BY TEAMS FROM AROUND THE WORLD
                </motion.h3>
                
                <div style={styles.gridContainer}>
                    <motion.ul 
                        style={styles.grid}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } }
                        }}
                    >
                        {[
                            { icon: Monitor, label: 'Systems' },
                            { icon: Cloud, label: 'Cloud' },
                            { icon: Database, label: 'Storage' },
                            { icon: Smartphone, label: 'Mobile' },
                            { icon: Globe, label: 'Global' },
                            { icon: Activity, label: 'Metrics' },
                        ].map((item, idx) => (
                            <motion.li 
                                key={idx}
                                style={styles.logoItem}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                                }}
                            >
                                <item.icon size={42} strokeWidth={1.5} color="#444" />
                                <span style={styles.logoLabel}>{item.label}</span>
                            </motion.li>
                        ))}
                    </motion.ul>
                </div>
            </div>
        </section>
    );
};

const styles = {
    section: {
        padding: '10vh 5vw 5vh 5vw',
        backgroundColor: '#FFFAF0',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    title: {
        fontWeight: 600,
        fontSize: '14px',
        color: 'rgba(5, 5, 5, 0.4)',
        textAlign: 'center',
        letterSpacing: '0.15em',
        marginBottom: '6vh',
        fontFamily: '"Outfit", sans-serif',
    },
    gridContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4vw 8vw',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        margin: 0,
        listStyle: 'none',
    },
    logoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        opacity: 0.7,
        filter: 'grayscale(100%)',
    },
    logoLabel: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#444',
        letterSpacing: '-0.02em',
        fontFamily: '"Outfit", sans-serif',
    }
};
