import React from 'react';

const Header = function (props) {
    let title = props.title || 'Shared server';
    return (
        <div style={{ color: 'rgba(0, 0, 0, 0.87)', backgroundColor: 'rgb(0, 188, 212)', transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms', boxSizing: 'border-box', fontFamily: 'Roboto, sans-serif', boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px', borderRadius: '0px', position: 'relative', zIndex: 1100, width: '100%', display: 'flex', paddingLeft: '24px', paddingRight: '24px', }}>
            <h1 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0px', paddingTop: '0px', letterSpacing: '0px', fontSize: '24px', fontWeight: 400, color: 'rgb(255, 255, 255)', height: '64px', lineHeight: '64px', flex: '1 1 0%' }}>{title}</h1>
        </div>
    );
};

export default Header;