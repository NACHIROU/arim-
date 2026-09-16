import { ShoppingCart, Store, Menu, UserCircle2, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useCart } from '@/context/CartContext';
import { CartPanel } from './CartPanel';
import { Badge } from '@/components/ui/badge';
import { Logo } from './Logo';

interface DecodedToken {
  role: string;
  exp: number;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { itemCount } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setUserRole(decodedToken.role);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('token'); 
          setIsLoggedIn(false);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location.pathname]);

  const handleLogout = (showAlert = true) => {
    localStorage.removeItem('token');
    if (showAlert) alert('Déconnexion réussie');
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/');
  };

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/shops", label: "Boutiques" },
    { href: "/products", label: "Produits" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo + Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center group py-0.5" aria-label="Ahimin Accueil">
            <Logo className="h-9 w-auto group-hover:scale-105 transition-transform duration-200" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  to={link.href} 
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    isActive 
                      ? "text-orange-600 bg-orange-50/80" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions Droite */}
        <div className="flex items-center gap-2.5">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="relative h-10 px-3.5 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl flex items-center gap-2 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 text-orange-500" />
                <span className="hidden sm:inline text-xs font-semibold">Panier</span>
                {itemCount > 0 && (
                  <Badge 
                    className="h-5 min-w-5 px-1.5 bg-orange-500 text-white flex items-center justify-center text-[11px] font-bold rounded-full border-0"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="border-l border-slate-200 bg-white">
              <CartPanel />
            </SheetContent>
          </Sheet>

          {!isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild className="h-10 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild className="h-10 px-4 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-all">
                <Link to="/register">S'inscrire</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-700">
                    <UserCircle2 className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-slate-200 shadow-lg rounded-xl p-1">
                  <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase px-2 py-1.5">Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-medium text-slate-700 hover:text-slate-900 focus:bg-slate-50">
                    <Link to="/profil" className="flex w-full items-center py-2 px-2">
                      <User className="h-4 w-4 mr-2 text-slate-400" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  {userRole === 'merchant' && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-medium text-slate-700 hover:text-slate-900 focus:bg-slate-50">
                      <Link to="/dashboard" className="flex w-full items-center py-2 px-2">
                        <Store className="h-4 w-4 mr-2 text-orange-500" />
                        Dashboard Vendeur
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-medium text-slate-700 hover:text-slate-900 focus:bg-slate-50">
                      <Link to="/admin/dashboard" className="flex w-full items-center py-2 px-2">
                        <Settings className="h-4 w-4 mr-2 text-slate-400" />
                        Dashboard Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem 
                    onClick={() => handleLogout()} 
                    className="rounded-lg text-rose-600 focus:text-rose-600 hover:bg-rose-50 focus:bg-rose-50 cursor-pointer font-medium py-2 px-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Menu Mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-700">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-r border-slate-200 bg-white">
                <div className="grid gap-6 py-6">
                  <Link to="/" className="flex items-center mb-2" aria-label="Ahimin Accueil">
                    <Logo className="h-8 w-auto" />
                  </Link>
                  <nav className="grid gap-1">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link 
                          to={link.href} 
                          className={`flex w-full items-center py-2.5 px-3 text-base font-semibold rounded-xl ${
                            location.pathname === link.href 
                              ? "text-orange-600 bg-orange-50" 
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="border-t border-slate-100 pt-6 mt-2">
                    {!isLoggedIn ? (
                      <div className="grid gap-2">
                        <Button variant="outline" className="w-full justify-start rounded-xl font-semibold border-slate-200" asChild>
                          <SheetClose asChild>
                            <Link to="/login">
                              <User className="mr-2 h-4 w-4" />
                              Se connecter
                            </Link>
                          </SheetClose>
                        </Button>
                        <Button className="w-full justify-start rounded-xl font-semibold bg-orange-500 hover:bg-orange-600 text-white" asChild>
                          <SheetClose asChild>
                            <Link to="/register">
                              <UserCircle2 className="mr-2 h-4 w-4" />
                              S'inscrire
                            </Link>
                          </SheetClose>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Button variant="outline" className="w-full justify-start rounded-xl font-semibold border-slate-200" asChild>
                          <SheetClose asChild>
                            <Link to="/profil">
                              <User className="mr-2 h-4 w-4" />
                              Mon Profil
                            </Link>
                          </SheetClose>
                        </Button>
                        {userRole === 'merchant' && (
                          <Button variant="outline" className="w-full justify-start rounded-xl font-semibold border-slate-200" asChild>
                            <SheetClose asChild>
                              <Link to="/dashboard">
                                <Store className="mr-2 h-4 w-4 text-orange-500" />
                                Dashboard
                              </Link>
                            </SheetClose>
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          className="w-full justify-start rounded-xl font-semibold mt-4 bg-rose-600 hover:bg-rose-700" 
                          onClick={() => handleLogout()}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Se déconnecter
                        </Button>
                      </div>
                    )}
                  </div>
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