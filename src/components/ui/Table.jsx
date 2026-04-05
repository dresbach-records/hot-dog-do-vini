import React from 'react';
import '../../styles/components/tables.css';

const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="table-responsive">
      <table 
        className={`data-table ${className}`} 
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export default Table;
