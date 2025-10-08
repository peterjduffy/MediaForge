import React from 'react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap'}}>
        <div>&copy; {new Date().getFullYear()} MediaForge</div>
        <div className="muted" style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <span>MediaForge is proud to be a member of the Google Cloud Partner Advantage programme</span>
          <Image
            src="/Google%20Advantage.png"
            alt="Google Cloud Partner Advantage"
            width={180}
            height={44}
            style={{height:'auto'}}
          />
        </div>
      </div>
    </footer>
  );
}
