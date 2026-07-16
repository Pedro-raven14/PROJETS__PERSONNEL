import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './layouts/Header';
import Dashboard    from './routes/Dashboard';
import Transactions from './routes/Transactions';
import Categories   from './routes/Categories';
import Statistiques from './routes/Statistiques';
import Parametres   from './routes/Parametres';

const Container = () => {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/"             element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"    element={<Dashboard />}    />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories"   element={<Categories />}   />
          <Route path="/statistiques" element={<Statistiques />} />
          <Route path="/parametres"   element={<Parametres />}   />
        </Routes>
      </main>
    </>
  );
};

export default Container;
