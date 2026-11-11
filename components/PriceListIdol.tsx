export default function PriceListIdol() {
  return (
    <div id="price" className="max-w-4xl mx-auto p-4 my-8">
      <h3 className="text-2xl font-black text-center text-slate-800 mb-6">
        <span className="text-pink-500">💰</span> 授業料（料金システム）
      </h3>

      {/* メインコース（授業料） */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-pink-500 mb-8">
        <div className="bg-pink-500 text-white p-3 text-center font-bold text-lg">
          アイドルコース（税込）
        </div>
        <div className="divide-y divide-pink-50">

          <div className="flex justify-between items-center p-4 hover:bg-pink-50 transition-colors">
            <div>
              <span className="font-bold text-slate-700 block">基本授業 <span className="text-lg">60分</span></span>
            </div>
            <span className="font-black text-2xl text-pink-600">18,000<span className="text-sm text-slate-500">円</span></span>
          </div>

          <div className="flex justify-between items-center p-4 hover:bg-pink-50 bg-yellow-50/50 transition-colors">
            <div>
              <span className="font-bold text-slate-700 block">放課後デート <span className="text-lg">80分</span></span>
              <span className="text-xs text-red-500 font-bold">オススメ！</span>
            </div>
            <span className="font-black text-2xl text-pink-600">22,000<span className="text-sm text-slate-500">円</span></span>
          </div>

          <div className="flex justify-between items-center p-4 hover:bg-pink-50 transition-colors">
            <div>
              <span className="font-bold text-slate-700 block">濃厚レッスン <span className="text-lg">100分</span></span>
            </div>
            <span className="font-black text-2xl text-pink-600">26,000<span className="text-sm text-slate-500">円</span></span>
          </div>

          <div className="flex justify-between items-center p-4 hover:bg-pink-50 transition-colors">
            <div>
              <span className="font-bold text-slate-700 block">秘密の合宿 <span className="text-lg">120分</span></span>
            </div>
            <span className="font-black text-2xl text-pink-600">34,000<span className="text-sm text-slate-500">円</span></span>
          </div>

          <div className="flex justify-between items-center p-4 hover:bg-pink-50 transition-colors">
            <div>
              <span className="font-bold text-slate-700 block">ロング留学 <span className="text-lg">150分</span></span>
            </div>
            <span className="font-black text-2xl text-pink-600">42,000<span className="text-sm text-slate-500">円</span></span>
          </div>

          <div className="flex justify-between items-center p-4 hover:bg-pink-50 transition-colors">
            <div>
              <span className="font-bold text-slate-700 block"><span className="text-lg">180分</span></span>
            </div>
            <span className="font-black text-2xl text-pink-600">50,000<span className="text-sm text-slate-500">円</span></span>
          </div>

        </div>
      </div>

      {/* オプション・延長 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow border p-4">
          <h4 className="font-bold text-slate-700 border-b pb-2 mb-2">延長・オプション</h4>
          <ul className="text-sm space-y-3 text-slate-700">
            <li className="flex justify-between items-center">
              <span className="font-bold">延長 30分</span>
              <span className="font-black text-pink-600 text-lg">10,000円</span>
            </li>
            <li className="flex justify-between items-center">
              <span>本指名料</span>
              <span className="font-bold">3,000円</span>
            </li>
            <li className="flex justify-between items-center">
              <span>写真指名料</span>
              <span className="font-bold">2,000円</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <h4 className="font-bold text-slate-700 border-b pb-2 mb-2">交通費・その他</h4>
          <ul className="text-sm space-y-2 text-slate-600">
             <li className="flex justify-between"><span>西船橋駅前</span> <span className="font-bold text-pink-500">無料</span></li>
             <li className="flex justify-between"><span>船橋・津田沼・市川</span> <span className="font-bold">1,000円〜</span></li>
             <li className="flex justify-between"><span>その他エリア</span> <span className="font-bold">応相談</span></li>
             <li className="text-xs mt-2 text-slate-400 border-t pt-2">
               ※各種クレジットカードご利用いただけます（手数料あり）
             </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
