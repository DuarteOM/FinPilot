export const formatCurrency = n => Math.abs(n).toLocaleString("pt-PT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export const formatRoundedCurrency = n => n.toLocaleString("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

let uid = 200;
export const nextId = () => ++uid;
