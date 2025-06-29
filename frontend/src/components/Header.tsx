import { ShoppingCart, Store, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React from "react";
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Déconnexion réussie');
    navigate('/');
  };

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/shops", label: "Boutiques" },
    { href: "/products", label: "Produits" },
  ];

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
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Panier</span>
          </Button>

          {/* Si non connecté => Afficher Login/Register */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Se connecter</Link>
              </Button>
              <Button asChild>
                <Link to="/register">S'inscrire</Link>
              </Button>
            </div>
          )}

          {/* Si connecté => Afficher Déconnexion */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="destructive" onClick={handleLogout}>
                Se déconnecter
              </Button>
            </div>
          )}

          {/* Menu mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="grid gap-4 py-4">
                  <nav className="grid gap-2">
                    {navLinks.map((link) => (
                      <Link key={link.href} to={link.href} className="flex w-full items-center py-2 text-lg font-semibold">
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile : Login/Register */}
                  {!isLoggedIn && (
                    <div className="grid gap-2 mt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/login">Se connecter</Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link to="/register">S'inscrire</Link>
                      </Button>
                    </div>
                  )}

                  {/* Mobile : Déconnexion */}
                  {isLoggedIn && (
                    <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>
                      Se déconnecter
                    </Button>
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
