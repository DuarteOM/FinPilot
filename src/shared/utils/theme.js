export const darkTheme  = { bg: "#0A0D12", panel: "#11151C", panel2: "#161B23", border: "#1F2530", text: "#F4F4F2", sub: "#9A9FA8", mut: "#5F6470", accent: "#5DCAA5", accent2: "#7F8FE4", danger: "#E0544F", warn: "#E8A33D" };
export const lightTheme = { bg: "#F6F5F1", panel: "#FFFFFF",  panel2: "#FBFAF7", border: "#E7E4DB", text: "#15171B", sub: "#62655F",  mut: "#9A988F", accent: "#0F6E56", accent2: "#534AB7", danger: "#A32D2D", warn: "#B36A00" };

export const createGlobalStyles = T => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500&display=swap');
  *{box-sizing:border-box}
  .fp-num{font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums}
  .fp-disp{font-family:'Space Grotesk',sans-serif}
  .fp-scroll::-webkit-scrollbar{width:5px}
  .fp-scroll::-webkit-scrollbar-thumb{background:rgba(120,120,120,.3);border-radius:8px}
  .fp-row{transition:background .17s ease}
  .fp-row:hover{background:${T.panel2}}
  .fp-btn{transition:transform .12s ease,opacity .12s ease;cursor:pointer}
  .fp-btn:hover{opacity:.88}
  .fp-btn:active{transform:scale(.96)}
  .fp-card{transition:transform .22s cubic-bezier(.2,.7,.3,1),box-shadow .22s ease,border-color .22s ease}
  .fp-card:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.16)}
  .fp-nav{transition:background .18s,color .18s,transform .15s,border-color .18s}
  .fp-nav:hover{transform:translateX(3px)}
  .fp-fill{transition:width 1s cubic-bezier(.2,.8,.2,1)}
  @keyframes fade-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scale-in{from{opacity:0;transform:scale(.96) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes slide-r{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes pulse{0%,100%{opacity:.45}50%{opacity:1}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes toast-in{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pop{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}
  .page{animation:fade-up .35s cubic-bezier(.2,.7,.3,1) both}
  .stagger{animation:fade-up .38s cubic-bezier(.2,.7,.3,1) both}
  .scale-in{animation:scale-in .18s ease both}
  .slide-r{animation:slide-r .28s cubic-bezier(.2,.7,.3,1) both}
  .dot{animation:pulse 1.3s infinite ease-in-out}
  .spinner{animation:spin .75s linear infinite}
  .float1{animation:float 6s ease-in-out infinite}
  .float2{animation:float 7s ease-in-out infinite 1s}
  .toast-in{animation:toast-in .24s ease both}
  .pop{animation:pop .3s cubic-bezier(.34,1.56,.64,1) both}
  input,select,textarea{font-family:'Inter',sans-serif}
  input::placeholder,textarea::placeholder{color:${T.mut}}
  select{background:${T.panel2};color:${T.text}}
`;
