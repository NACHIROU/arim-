import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion.
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est connecté, on affiche la page demandée (ProfilePage, Dashboard, etc.).
  return <Outlet />;
};

export default ProtectedRoute;