
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Instagram, Twitter, Facebook, MessageSquare, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";

const Footer: React.FC = () => {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSuggestion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:8000/suggestions/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion),
      });
      if (!response.ok) throw new Error("L'envoi a échoué.");
      toast({ title: "Merci !", description: "Votre suggestion a bien été envoyée." });
      setSuggestion({ name: '', email: '', message: '' }); // Vider le formulaire
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        
        {/* Colonne 1: Logo et description */}
        <div className="md:col-span-3 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <Store className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xl">Arimin</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            La marketplace qui rapproche les commerçants locaux et les clients de leur quartier.
            Découvrez les produits disponibles près de chez vous et soutenez l'économie locale.
          </p>
          <div className="flex items-center gap-5 mt-6">
            <a href="#" aria-label="Facebook" className="hover:text-primary transition-colors transform hover:scale-110">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors transform hover:scale-110">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-primary transition-colors transform hover:scale-110">
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Colonne 2: Formulaire de suggestion */}
        <div className="md:col-span-2 lg:col-span-2">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Une suggestion ? Écrivez-nous !
          </h3>
          <form onSubmit={handleSubmitSuggestion} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input 
                type="text" 
                name="name" 
                placeholder="Nom et prénom" 
                value={suggestion.name} 
                onChange={handleInputChange} 
                required
                className="bg-background/60 focus:bg-background transition-colors"
              />
              <Input 
                type="email" 
                name="email" 
                placeholder="Votre email" 
                value={suggestion.email} 
                onChange={handleInputChange} 
                required
                className="bg-background/60 focus:bg-background transition-colors" 
              />
            </div>
            <Textarea 
              name="message" 
              placeholder="Votre message ou suggestion..." 
              value={suggestion.message} 
              onChange={handleInputChange} 
              required
              className="bg-background/60 focus:bg-background transition-colors resize-none min-h-[100px]"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 transition-colors"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
            </Button>
          </form>
        </div>

        {/* Colonne 3: Liens utiles */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Contact
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 group">
              <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              <a href="mailto:contact@arimin.com" className="text-muted-foreground hover:text-primary transition-colors">
                contact@arimin.com
              </a>
            </li>
            <li className="flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground group-hover:text-primary">
                <circle cx="12" cy="12" r="10" />
                <path d="m12 16 4-4-4-4" />
                <path d="M8 12h8" />
              </svg>
              <a href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </a>
            </li>
            <li className="flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground group-hover:text-primary">
                <circle cx="12" cy="12" r="10" />
                <path d="m12 16 4-4-4-4" />
                <path d="M8 12h8" />
              </svg>
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Conditions d'utilisation
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/30">
        <div className="container py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Arimin. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;