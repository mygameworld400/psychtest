export default function PriceTag({ list, sale }) {
  return (
    <span className="price-tag">
      <span className="price-list">{list.toLocaleString()}원</span>
      <span className="price-sale">{sale.toLocaleString()}원</span>
    </span>
  )
}
