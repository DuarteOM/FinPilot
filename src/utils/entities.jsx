import { Briefcase, Dumbbell, Film, Fuel, Home, ShoppingBag, Target, Utensils, Zap } from "lucide-react";

const icons={"Restauração":Utensils,"Supermercado":ShoppingBag,"Transportes":Fuel,"Combustível":Fuel,"Subscrições":Film,"Casa":Home,"Saúde":Dumbbell,"Receita":Zap,"Compras":ShoppingBag};
export const iconFor=name=>icons[name]||Briefcase;
export const hydrateTransaction=item=>({...item,cat:item.category,date:item.date,ds:item.date,icon:iconFor(item.category)});
export const hydrateBudget=item=>({...item,icon:iconFor(item.name)});
export const hydrateGoal=item=>({...item,prob:item.probability,icon:item.name.toLowerCase().includes("casa")?Home:Target});
export const hydrateSubscription=item=>({...item,icon:Film});
