import { ShoppingCart, Store, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // <-- 1. On importe la librairie

// Interface pour typer le contenu de notre token
interface DecodedToken {
  role: string;
  exp: number;
  // Ajoutez d'autres champs si nécessaire
}

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Pour détecter les changements de page
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Token invalide:", error);
        handleLogout(false); // Déconnexion si le token est invalide
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, [location]); // On ré-évalue à chaque changement de page

  const handleLogout = (showAlert = true) => {
    localStorage.removeItem('token');
    if (showAlert) alert('Déconnexion réussie');
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/');
  };

  // On construit la liste des liens de base
  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/shops", label: "Boutiques" },
    { href: "/products", label: "Produits" },
  ];

  // --- 2. On ajoute le lien "Gestion" conditionnellement ---
  if (isLoggedIn && userRole === 'merchant') {
    navLinks.push({ href: "/dashboard", label: "Gestion" });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo + Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-lg">ahimin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Boutons de droite */}
        <div className="flex items-center gap-2">


          {/* Si non connecté */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" asChild><Link to="/login">Se connecter</Link></Button>
              <Button asChild><Link to="/register">S'inscrire</Link></Button>
            </div>
          )}

          {/* Si connecté */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="destructive" onClick={() => handleLogout()}>Se déconnecter</Button>
            </div>
          )}

          {/* Menu mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
              <SheetContent>
                <div className="grid gap-4 py-4">
                  <nav className="grid gap-2">
                    {navLinks.map((link) => (
                      <Link key={link.href} to={link.href} className="flex w-full items-center py-2 text-lg font-semibold">{link.label}</Link>
                    ))}
                  </nav>
                  {!isLoggedIn && (
                    <div className="grid gap-2 mt-4">
                      <Button variant="outline" className="w-full" asChild><Link to="/login">Se connecter</Link></Button>
                      <Button className="w-full" asChild><Link to="/register">S'inscrire</Link></Button>
                    </div>
                  )}
                  {isLoggedIn && (
                    <Button variant="destructive" className="w-full mt-4" onClick={() => handleLogout()}>Se déconnecter</Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;