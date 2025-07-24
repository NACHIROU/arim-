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

interface DecodedToken {
  role: string;
  exp: number;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);  const [userRole, setUserRole] = useState<string | null>(null);
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo + Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <Store className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg">Ahimin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                to={link.href} 
                className={`transition-colors relative ${
                  location.pathname === link.href 
                    ? "text-foreground font-medium after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-[-18px] after:left-0" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Boutons de droite */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-muted/70 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs shadow-sm animate-in fade-in-50 zoom-in-95"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="border-l border-border/60">
              <CartPanel />
            </SheetContent>
          </Sheet>

          {!isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" asChild className="bg-white hover:bg-gray-100 transition-colors">
                <Link to="/login">Se connecter</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all">
                <Link to="/register">S'inscrire</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/70 transition-colors">
                    <UserCircle2 className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-border/60 shadow-lg animate-in fade-in-80 zoom-in-95 slide-in-from-top-5">
                  <DropdownMenuLabel className="text-primary">Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted focus:bg-muted">
                    <Link to="/profil" className="flex w-full items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  {userRole === 'merchant' && (
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted focus:bg-muted">
                      <Link to="/dashboard" className="flex w-full items-center">
                        <Store className="h-4 w-4 mr-2 text-muted-foreground" />
                        Mon Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted focus:bg-muted">
                      <Link to="/admin/dashboard" className="flex w-full items-center">
                        <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                        Dashboard Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleLogout()} 
                    className="text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted/70 transition-colors">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-r border-border/60">
                <div className="grid gap-6 py-6">
                  <Link to="/" className="flex items-center gap-2 mb-4">
                    <Store className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">Ahimin</span>
                  </Link>
                  <nav className="grid gap-3">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link 
                          to={link.href} 
                          className={`flex w-full items-center py-2 text-lg font-medium pl-2 rounded-md ${
                            location.pathname === link.href 
                              ? "text-primary bg-muted" 
                              : "hover:bg-muted/50"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="border-t pt-6 mt-2">
                    {!isLoggedIn ? (
                      <div className="grid gap-3">
                        <Button variant="outline" className="w-full justify-start pl-2" asChild>
                          <SheetClose asChild>
                            <Link to="/login">
                              <User className="mr-2 h-4 w-4" />
                              Se connecter
                            </Link>
                          </SheetClose>
                        </Button>
                        <Button className="w-full justify-start pl-2 bg-primary" asChild>
                          <SheetClose asChild>
                            <Link to="/register">
                              <UserCircle2 className="mr-2 h-4 w-4" />
                              S'inscrire
                            </Link>
                          </SheetClose>
                        </Button>
                      </div>
                    ) : (
                       <div className="grid gap-3">
                          <Button variant="outline" className="w-full justify-start pl-2" asChild>
                            <SheetClose asChild>
                              <Link to="/profil">
                                <User className="mr-2 h-4 w-4" />
                                Mon Profil
                              </Link>
                            </SheetClose>
                          </Button>
                          {userRole === 'merchant' && 
                            <Button variant="outline" className="w-full justify-start pl-2" asChild>
                              <SheetClose asChild>
                                <Link to="/dashboard">
                                  <Store className="mr-2 h-4 w-4" />
                                  Dashboard
                                </Link>
                              </SheetClose>
                            </Button>
                          }
                          {userRole === 'admin' && 
                            <Button variant="outline" className="w-full justify-start pl-2" asChild>
                              <SheetClose asChild>
                                <Link to="/admin/dashboard">
                                  <Settings className="mr-2 h-4 w-4" />
                                  Dashboard Admin
                                </Link>
                              </SheetClose>
                            </Button>
                          }
                          <Button 
                            variant="destructive" 
                            className="w-full justify-start pl-2 mt-4" 
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