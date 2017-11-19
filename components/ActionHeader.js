import React from 'react';
import FlatButton from 'material-ui/FlatButton';


const ActionHeader = function (props) {
    let title = props.title || 'Shared server';
    return (
        <div style={{ color: 'white', backgroundColor: 'rgb(0, 188, 212)', transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms', boxSizing: 'border-box', fontFamily: 'Roboto, sans-serif', borderRadius: '0px', position: 'relative', zIndex: 1100, width: '100%', display: 'flex', paddingLeft: '24px', paddingRight: '24px', }}>
            <FlatButton style={{ color: 'white' }} label="Volver" onClick={props.onClick} />
        </div>
    );
};

export default ActionHeader;