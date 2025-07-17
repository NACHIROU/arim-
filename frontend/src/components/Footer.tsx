import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";

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
    <footer className="border-t bg-slate-100 text-slate-800">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        
        {/* Colonne 1: Logo et description */}
        <div className="md:col-span-3 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Arimin</span>
          </Link>
          <p className="text-sm text-muted-foreground">La marketplace qui rapproche les commerçants locaux et les clients de leur quartier.</p>
          <div className="flex items-center gap-4 mt-6">
            <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5 hover:text-primary transition-colors" /></a>
            <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5 hover:text-primary transition-colors" /></a>
            <a href="#" aria-label="Twitter"><Twitter className="h-5 w-5 hover:text-primary transition-colors" /></a>
          </div>
        </div>

        {/* Colonne 2: Formulaire de suggestion */}
        <div className="md:col-span-2 lg:col-span-2">
          <h3 className="font-semibold mb-4">Une suggestion ? Écrivez-nous !</h3>
          <form onSubmit={handleSubmitSuggestion} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input type="text" name="name" placeholder="Nom et prénom" value={suggestion.name} onChange={handleInputChange} required />
              <Input type="email" name="email" placeholder="Votre email" value={suggestion.email} onChange={handleInputChange} required />
            </div>
            <Textarea name="message" placeholder="Votre message ou suggestion..." value={suggestion.message} onChange={handleInputChange} required />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
            </Button>
          </form>
        </div>

        {/* Colonne 3: Liens utiles */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold mb-4">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="mailto:contact@arimin.com" className="text-muted-foreground hover:text-primary">contact@arimin.com</a></li>
            <li><a href="/faq" className="text-muted-foreground hover:text-primary">FAQ</a></li>
            <li><a href="/terms" className="text-muted-foreground hover:text-primary">Conditions d'utilisation</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Arimin. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;