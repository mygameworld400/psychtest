import { useState } from 'react'
import PriceTag from './PriceTag'
import { purchase } from '../services/purchaseService'

/** product: null이면 닫힌 상태. { sku, name, desc, list, sale } */
export default function PurchaseSheet({ product, onClose, onPurchased }) {
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(false)

  if (!product) return null

  async function pay() {
    setPaying(true)
    setError(false)
    try {
      await purchase(product.sku)
      onPurchased?.(product.sku)
      onClose()
    } catch {
      setError(true)
    } finally {
      setPaying(false)
    }
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <h3>{product.name}</h3>
        <p className="sheet-sub">{product.desc}</p>
        <PriceTag list={product.list} sale={product.sale} />
        <button className="btn-primary" onClick={pay} disabled={paying}>
          {paying ? '처리 중…' : '결제하기'}
        </button>
        <button className="btn-ghost" onClick={onClose} disabled={paying}>
          다음에 할게요
        </button>
        {error && <p className="error">결제 처리에 실패했어요. 다시 시도해주세요.</p>}
        <div className="sheet-note">
          실제 결제(PG) 연동 전 화면이에요. 결제하기를 누르면 구매 완료 처리만 시뮬레이션해요.
        </div>
      </div>
    </>
  )
}
