
import { Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="border-t bg-background">
            <div className="container py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">© {new Date().getFullYear()} Marketplace. Tous droits réservés.</span>
                </div>
                <nav className="flex items-center gap-4 text-sm">
                    <Link to="#" className="text-muted-foreground hover:text-foreground">Conditions</Link>
                    <Link to="#" className="text-muted-foreground hover:text-foreground">Confidentialité</Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
