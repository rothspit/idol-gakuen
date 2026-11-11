import Link from 'next/link'
import { FAQ_ITEMS, GUIDE_PAGES, getGuideSlugs } from '@/lib/seo/funabashi'
import { CAST_AGE_POLICY } from '@/lib/seo/site'

export default function FunabashiSeoContent() {
  const guideSlugs = getGuideSlugs()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white border-t border-slate-100">
      <h2 className="text-lg font-black text-slate-800 mb-4">
        船橋・千葉で人気のデリヘルなら「アイドル学園」
      </h2>
      <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
        <p>
          船橋・西船橋・津田沼を中心に、市川・本八幡・幕張方面まで出張対応するデリバリーヘルスです。
          制服・コスプレ・放課後デート感のコンセプトで、JK・女子大生系の雰囲気を好む方からも支持されています。
          船橋で「JKリフレ」「制服」「即案内」をお探しの方も、出張型ならではのプライベート空間でご案内できます。
        </p>
        <p>
          <strong>【明朗会計・初心者歓迎】</strong>
          <br />
          パネル指名料や消費税などの不明瞭な追加料金はありません。デリヘルが初めての方、リフレから乗り換えの方も、電話・チャットで丁寧にご案内します。
        </p>
        <p className="text-xs text-slate-500">
          ※在籍キャストは{CAST_AGE_POLICY}です。風営法に基づき、高校に在学中の方の雇用は一切行っておりません。
        </p>

        <h3 className="font-bold text-slate-800 mt-6 mb-3">📍 エリア別ガイド</h3>
        <ul className="grid grid-cols-2 gap-2 text-xs">
          {guideSlugs.map((slug) => (
            <li key={slug}>
              <Link
                href={`/funabashi/guide/${slug}`}
                className="block border border-pink-100 rounded-lg px-3 py-2 text-pink-600 font-bold hover:bg-pink-50 transition-colors"
              >
                {GUIDE_PAGES[slug].title}
              </Link>
            </li>
          ))}
        </ul>

        <h3 className="font-bold text-slate-800 mt-6 mb-2">❓ よくある質問 (FAQ)</h3>
        <dl className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="border-b border-slate-100 pb-3">
              <dt className="font-bold text-pink-600 text-xs">Q. {item.question}</dt>
              <dd className="mt-1 text-xs leading-relaxed">A. {item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
