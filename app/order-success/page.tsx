export default function OrderSuccess({ searchParams }: { searchParams: { orderNo?: string } }) {
  return <main className="container section"><div className="card"><h1>訂單成立</h1><p>訂單編號：{searchParams.orderNo}</p><p>狀態：待付款</p><p>請依匯款資訊完成轉帳，客服將於確認後更新狀態。</p></div></main>;
}
