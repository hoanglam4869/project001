// src/components/Header.jsx
import React from 'react';
import '../css/header.scss';
import logo from'../assets/logo.png';
import hotline from'../assets/hotline.png';
import user from'../assets/user.jpg';
import vnlogo from'../assets/vnlogo.png';


const Header = () => {


  return (
    <header className="header">
        <div className='header-left'>
            <img src={logo} alt="Logo"/>
            <p>Hotels & Resorts</p>
        </div>
        <div className='header-right'>
            <div className='header-right-info'>
                <div className='inform'>
                    <img src={hotline} alt="Hotline"/>
                <p>(+84) 0123456789</p>
                </div>
                <div className='inform'>
                    <img src={user} alt="User"/>
                    <p>Thành viên</p>
                </div>
                <div className='inform'>
                    <img src={vnlogo} alt="VN"/>
                    <p>VI</p>
                </div>
            </div>
            <div className='header-right-menu'>
                <ul>
                    <li>Quần thể</li>
                    <li>Ưu đãi</li>
                    <li>Trải nghiệm</li>
                    <li>Liên hệ</li>
                    <li>Về chúng tôi</li>
                </ul>
            </div>
        </div>
    </header>
  );
};

export default Header;