import {
  AlertTriangle, Briefcase, Dumbbell, Film, Fuel, Home, Plane,
  PartyPopper, Shield, ShoppingBag, TrendingDown, TrendingUp, Utensils, Zap,
} from "lucide-react";

export const TREND=[{m:"Jan",income:2400,expense:1680},{m:"Fev",income:2400,expense:1820},{m:"Mar",income:2550,expense:1900},{m:"Abr",income:2400,expense:1740},{m:"Mai",income:2700,expense:2010},{m:"Jun",income:2400,expense:1590},{m:"Jul",income:2650,expense:1860}];
export const REPORT_DATA=[{m:"Jan",income:2400,expense:1680,saved:720},{m:"Fev",income:2400,expense:1820,saved:580},{m:"Mar",income:2550,expense:1900,saved:650},{m:"Abr",income:2400,expense:1740,saved:660},{m:"Mai",income:2700,expense:2010,saved:690},{m:"Jun",income:2400,expense:1590,saved:810},{m:"Jul",income:2650,expense:1860,saved:790}];
export const CATS=[{name:"Restauração",value:412,color:"#E8A33D",icon:Utensils},{name:"Supermercado",value:358,color:"#5DCAA5",icon:ShoppingBag},{name:"Transportes",value:196,color:"#7F8FE4",icon:Fuel},{name:"Subscrições",value:64,color:"#D4537E",icon:Film},{name:"Casa",value:540,color:"#888780",icon:Home}];
export const TX0=[
  {id:1,merchant:"Continente",cat:"Supermercado",date:"2025-07-30",ds:"Hoje, 09:42",amount:-64.2,icon:ShoppingBag,color:"#5DCAA5"},
  {id:2,merchant:"Netflix",cat:"Subscrições",date:"2025-07-30",ds:"Hoje, 06:00",amount:-12.99,icon:Film,color:"#D4537E"},
  {id:3,merchant:"Galp",cat:"Combustível",date:"2025-07-29",ds:"Ontem, 18:21",amount:-45.0,icon:Fuel,color:"#7F8FE4"},
  {id:4,merchant:"Salário — Acme Lda",cat:"Receita",date:"2025-07-29",ds:"Ontem, 09:00",amount:2400,icon:Zap,color:"#5DCAA5"},
  {id:5,merchant:"Cervejaria Ramiro",cat:"Restauração",date:"2025-07-28",ds:"28 jul",amount:-38.5,icon:Utensils,color:"#E8A33D"},
  {id:6,merchant:"Worten",cat:"Compras",date:"2025-07-27",ds:"27 jul",amount:-129.9,icon:ShoppingBag,color:"#7F8FE4"},
  {id:7,merchant:"Spotify",cat:"Subscrições",date:"2025-07-26",ds:"26 jul",amount:-9.99,icon:Film,color:"#D4537E"},
  {id:8,merchant:"Uber",cat:"Transportes",date:"2025-07-26",ds:"26 jul",amount:-8.4,icon:Fuel,color:"#7F8FE4"},
  {id:9,merchant:"Fitness Hut",cat:"Saúde",date:"2025-07-24",ds:"24 jul",amount:-34.9,icon:Dumbbell,color:"#5DCAA5"},
  {id:10,merchant:"Freelance — Projeto X",cat:"Receita",date:"2025-07-23",ds:"23 jul",amount:380,icon:Briefcase,color:"#5DCAA5"},
  {id:11,merchant:"McDonald's",cat:"Restauração",date:"2025-07-22",ds:"22 jul",amount:-11.4,icon:Utensils,color:"#E8A33D"},
  {id:12,merchant:"EDP",cat:"Casa",date:"2025-07-21",ds:"21 jul",amount:-78.3,icon:Home,color:"#888780"},
  {id:13,merchant:"Renda — Julho",cat:"Casa",date:"2025-07-01",ds:"1 jul",amount:-850,icon:Home,color:"#888780"},
  {id:14,merchant:"Auchan",cat:"Supermercado",date:"2025-07-18",ds:"18 jul",amount:-47.6,icon:ShoppingBag,color:"#5DCAA5"},
  {id:15,merchant:"Decathlon",cat:"Compras",date:"2025-07-15",ds:"15 jul",amount:-89.9,icon:Dumbbell,color:"#7F8FE4"},
];
export const GOALS0=[
  {id:1,name:"Entrada para casa",saved:8400,target:20000,eta:"Out 2027",monthly:420,icon:Home,color:"#5DCAA5",prob:82},
  {id:2,name:"Viagem ao Japão",saved:1180,target:3200,eta:"Mar 2027",monthly:165,icon:Plane,color:"#7F8FE4",prob:91},
  {id:3,name:"Fundo de emergência",saved:2600,target:6000,eta:"Jan 2027",monthly:280,icon:Briefcase,color:"#E8A33D",prob:76},
];
export const BDG0=[
  {id:1,name:"Alimentação",limit:300,spent:412,icon:Utensils,color:"#E8A33D"},
  {id:2,name:"Transportes",limit:150,spent:96,icon:Fuel,color:"#7F8FE4"},
  {id:3,name:"Lazer",limit:200,spent:140,icon:Film,color:"#D4537E"},
  {id:4,name:"Supermercado",limit:380,spent:358,icon:ShoppingBag,color:"#5DCAA5"},
  {id:5,name:"Casa",limit:600,spent:540,icon:Home,color:"#888780"},
];
export const SUB0=[
  {id:1,name:"Netflix",monthly:12.99,next:"3 ago",icon:Film,color:"#D4537E",used:true,active:true},
  {id:2,name:"Spotify",monthly:9.99,next:"7 ago",icon:Film,color:"#5DCAA5",used:true,active:true},
  {id:3,name:"Adobe CC",monthly:24.59,next:"12 ago",icon:Briefcase,color:"#E8A33D",used:false,active:true},
  {id:4,name:"iCloud+",monthly:2.99,next:"15 ago",icon:Shield,color:"#7F8FE4",used:true,active:true},
  {id:5,name:"Disney+",monthly:8.99,next:"20 ago",icon:Film,color:"#D4537E",used:false,active:true},
];
export const NTF0=[
  {id:1,icon:AlertTriangle,color:"#E8A33D",title:"Orçamento quase no limite",text:"Já usaste 137% do orçamento de Alimentação este mês.",time:"há 12 min",read:false},
  {id:2,icon:Zap,color:"#5DCAA5",title:"Salário recebido",text:"Entrada de 2.400€ — Acme Lda.",time:"há 3 h",read:false},
  {id:3,icon:TrendingUp,color:"#7F8FE4",title:"Gastaste 28% mais em restaurantes",text:"Comparado com a média dos últimos 3 meses.",time:"Ontem",read:false},
  {id:4,icon:PartyPopper,color:"#5DCAA5",title:"Quase lá!",text:"Faltam apenas 165€ para o objetivo \"Viagem ao Japão\".",time:"Ontem",read:true},
  {id:5,icon:TrendingDown,color:"#D4537E",title:"Despesa invulgar detetada",text:"Worten: 129,90€ — 3× acima do teu padrão habitual.",time:"há 3 dias",read:true},
];
export const CHAT0=[{role:"assistant",text:"Olá! Sou o FinPilot. Este mês já gastaste 1.570€ — 6% abaixo da média. Como posso ajudar?"}];
export const REPS={
  "onde estou a gastar mais dinheiro?":"A tua maior categoria é Casa (540€), seguida de Restauração (412€). Restauração subiu 18% face ao mês passado — sobretudo ao fim de semana.",
  "quanto posso gastar este fim de semana?":"Com base no orçamento de Lazer (200€, 140€ usados), tens cerca de 60€ confortáveis sem comprometer a poupança mensal.",
  "como posso poupar 200€ por mês?":"Cancelar Adobe CC (24,59€/mês, pouco usada) + reduzir Restauração para 300€ já te dá ~135€. O resto vem de comprar combustível com cartão desconto.",
};
export const CAT_NAMES=["Restauração","Supermercado","Transportes","Subscrições","Casa","Saúde","Compras","Receita","Combustível","Outros"];
export const COLORS=["#E8A33D","#5DCAA5","#7F8FE4","#D4537E","#888780","#4ECDC4","#A78BFA","#34D399"];
