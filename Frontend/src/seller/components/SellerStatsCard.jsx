export default function SellerStatsCard({ label, value }) {
  return (
    <div className="bg-[#440077] text-yellow-300 shadow-lg px-8 py-5 rounded-xl font-bold text-xl flex-1 text-center">
      {label}
      <div className="font-extrabold text-4xl mt-2">{value}</div>
    </div>
  )
}
