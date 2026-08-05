import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404: rota não encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
        <FlaskConical className="h-6 w-6 text-primary" />
      </div>
      <h1 className="mb-2 text-4xl font-bold text-foreground">404</h1>
      <p className="mb-6 text-muted-foreground">Esta página não existe ou foi movida.</p>
      <Button onClick={() => navigate("/")}>Voltar para o início</Button>
    </div>
  );
};

export default NotFound;
