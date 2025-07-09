
import { ShoppingCart, Store, Menu, UserCircle2, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role: string;
  exp: number;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Ce useEffect se met à jour à chaque changement de page pour refléter l'état de connexion
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        // On vérifie si le token n'est pas expiré
        if (decodedToken.exp * 1000 > Date.now()) {
          setUserRole(decodedToken.role);
          setIsLoggedIn(true);
        } else {
          // Si le token est expiré, on le supprime
          handleLogout(false);
        }
      } catch (error) {
        handleLogout(false);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, [location.pathname]); // Dépend du changement d'URL

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
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo + Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group transition-all duration-300 hover:scale-105">
            <div className="relative">
              <Store className="h-7 w-7 text-primary transition-all duration-300 group-hover:text-primary/80" />
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Ahimin
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                to={link.href} 
                className={`relative text-muted-foreground transition-all duration-300 hover:text-foreground font-medium px-3 py-2 rounded-lg hover:bg-accent/50 ${
                  location.pathname === link.href ? 'text-primary bg-accent/30' : ''
                }`}
              >
                {link.label}
                {location.pathname === link.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Boutons de droite */}
        <div className="flex items-center gap-3">
  

          {/* Si non connecté => Affiche les boutons Login/Register */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="outline" 
                asChild 
                className="transition-all duration-300 hover:scale-105 hover:shadow-md border-4 border-0 bg-white hover:bg-gray-50 hover:text-black"
              >
                <Link to="/login">Se connecter</Link>
              </Button>
              <Button 
                asChild 
                className="transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                <Link to="/register">S'inscrire</Link>
              </Button>
            </div>
          )}

          {/* Si connecté => Affiche le menu déroulant du profil */}
          {isLoggedIn && (
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-accent/80 transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-primary/20"
                  >
                    <UserCircle2 className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 mt-2 bg-white/95 "
                >
                
                  {/* --- CORRECTION : On utilise la couleur de fond du projet --- */}
                  <DropdownMenuLabel className="text-center py-3 bg-white">
                    <div className="font-semibold">Mon Compte</div>
                    <div className="text-xs text-muted-foreground capitalize">{userRole === 'merchant' ? 'Marchand' : 'Client'}</div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer bg-white transition-colors duration-200">
                    <Link to="/profil" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  {userRole === 'merchant' && (
                    <DropdownMenuItem asChild className="cursor-pointer bg-white transition-colors duration-200">
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Mon Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleLogout()} 
                    className="text-red-500 bg-white focus:text-red-600 cursor-pointer transition-colors duration-200 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Menu mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-accent/80 transition-all duration-300 hover:scale-110"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-gradient-to-b from-background to-background/95">
                <div className="grid gap-6 py-6">
                  {/* Logo mobile */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Store className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Ahimin
                    </span>
                  </div>
                  
                  <nav className="grid gap-2">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link 
                          to={link.href} 
                          className={`flex w-full items-center py-3 px-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:bg-accent/80 ${
                            location.pathname === link.href ? 'bg-accent text-primary' : ''
                          }`}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                    {/* Liens de profil dans le menu mobile */}
                    {isLoggedIn && userRole === 'merchant' && (
                       <SheetClose asChild>
                         <Link 
                           to="/dashboard" 
                           className="flex w-full items-center py-3 px-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:bg-accent/80"
                         >
                           <Settings className="h-5 w-5 mr-3" />
                           Gestion
                         </Link>
                       </SheetClose>
                    )}
                  </nav>
                  
                  <div className="border-t pt-6 mt-2">
                    {!isLoggedIn ? (
                      <div className="grid gap-3">
                        <Button 
                          variant="outline" 
                          className="w-full transition-all duration-300 hover:scale-105 border-4" 
                          asChild
                        >
                          <SheetClose asChild>
                            <Link to="/login">Se connecter</Link>
                          </SheetClose>
                        </Button>
                        <Button 
                          className="w-full transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90" 
                          asChild
                        >
                          <SheetClose asChild>
                            <Link to="/register">S'inscrire</Link>
                          </SheetClose>
                        </Button>
                      </div>
                    ) : (
                       <div className="grid gap-3">
                          <Button 
                            variant="secondary" 
                            className="w-full transition-all duration-300 hover:scale-105" 
                            asChild
                          >
                            <SheetClose asChild>
                              <Link to="/profile" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Mon Profil
                              </Link>
                            </SheetClose>
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="w-full transition-all duration-300 hover:scale-105" 
                            onClick={() => handleLogout()}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
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