import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Upload } from "lucide-react";

interface DashboardShopCardProps {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  is_published: boolean;
  onEdit: (shopId: string) => void;
  onPublish: (shopId: string) => void;
}

const DashboardShopCard: React.FC<DashboardShopCardProps> = ({
  id,
  name,
  description,
  image_url,
  is_published,
  onEdit,
  onPublish,
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-transform hover:-translate-y-1">
      {image_url && (
        <img src={image_url} alt={name} className="w-full h-32 object-cover" />
      )}
      <CardContent>
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button size="sm" variant="outline" onClick={() => onEdit(id)}>
          <Pencil className="h-4 w-4 mr-1" /> Modifier
        </Button>
        {!is_published && (
          <Button size="sm" onClick={() => onPublish(id)}>
            <Upload className="h-4 w-4 mr-1" /> Publier
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DashboardShopCard;
