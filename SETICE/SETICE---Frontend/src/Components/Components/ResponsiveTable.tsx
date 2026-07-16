import React from 'react';
import DataTable, { type TableProps } from 'react-data-table-component';

interface ResponsiveTableProps extends TableProps<any> {
  mobileBreakpoint?: number;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ 
  mobileBreakpoint = 768, 
  ...props 
}) => {
  const customStyles = {
    table: {
      style: {
        minWidth: '100%',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8fafc',
        borderBottomWidth: '1px',
        borderBottomColor: '#e2e8f0',
        minHeight: '48px',
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '12px',
        paddingBottom: '12px',
      },
    },
    rows: {
      style: {
        minHeight: '56px',
        '&:hover': {
          backgroundColor: '#f9fafb',
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          {...props}
          responsive
          highlightOnHover
          customStyles={customStyles}
          noDataComponent={
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 text-lg mb-2">Aucune donnée disponible</div>
              <div className="text-gray-500 text-sm">Il n'y a aucun élément à afficher pour le moment.</div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ResponsiveTable;