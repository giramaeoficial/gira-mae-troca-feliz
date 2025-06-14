
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, User, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const QuickNav = () => {
    const location = useLocation();
    
    const navItems = [
        { 
            icon: Search, 
            label: "Explorar", 
            path: "/feed",
            description: "Encontre itens"
        },
        { 
            icon: Plus, 
            label: "Publicar", 
            path: "/publicar-item",
            description: "Adicione um item"
        },
        { 
            icon: Wallet, 
            label: "Carteira", 
            path: "/carteira",
            description: "Suas Girinhas"
        },
        { 
            icon: User, 
            label: "Perfil", 
            path: "/perfil",
            description: "Seus itens"
        }
    ];

    return (
        <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm border-primary/20 shadow-xl md:hidden">
            <div className="flex items-center gap-2 p-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                        <Button
                            key={item.path}
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            asChild
                            className={`flex flex-col h-auto py-2 px-3 ${
                                isActive ? "bg-gradient-to-r from-primary to-pink-500" : ""
                            }`}
                        >
                            <Link to={item.path}>
                                <Icon className="w-4 h-4 mb-1" />
                                <span className="text-xs">{item.label}</span>
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </Card>
    );
};

export default QuickNav;
