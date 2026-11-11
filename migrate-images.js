const { createClient } = require('@supabase/supabase-js');

// ▼▼▼ 自分の環境に合わせて書き換え ▼▼▼
const SUPABASE_URL = 'https://nuxojcydwxhecncbwjpb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eG9qY3lkd3hoZWNuY2J3anBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MTEwNTMsImV4cCI6MjA4NDI4NzA1M30.2kdY32rIAFiSjM5VUa5BPkyCrFNooKBNIjHmy4iOWyQ'; // ここに service_role key を入れる

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrateImages() {
    console.log('🚀 画像お引越し作戦（cast-photosへ）スタート...');

    // 1. 直リンク(http...)の女の子を取得
    const { data: girls, error } = await supabase
        .from('girls')
        .select('id, name, image1_url')
        .ilike('image1_url', 'http%')
        .not('image1_url', 'is', null);

    if (error) {
        console.error('❌ データ取得エラー:', error);
        return;
    }

    console.log(`📋 ${girls.length}人のデータが見つかりました。移行を開始します。`);

    for (const girl of girls) {
        const oldUrl = girl.image1_url;

        // 既にSupabaseのURLになっている場合はスキップ
        if (oldUrl.includes('supabase.co')) {
            console.log(`⏭️ ${girl.name} は既に移行済みです。`);
            continue;
        }

        try {
            console.log(`\n⏳ ${girl.name} の画像を処理中...`);

            // A. 画像をダウンロード
            const response = await fetch(oldUrl);
            if (!response.ok) throw new Error(`画像の取得に失敗: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // B. ファイル名を決定
            const fileName = `${girl.id}-${Date.now()}.jpg`;

            // C. cast-photos にアップロード (★ここを修正しました)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('cast-photos')
                .upload(fileName, buffer, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // D. 公開URLを取得 (★ここも修正しました)
            const { data: publicUrlData } = supabase.storage
                .from('cast-photos')
                .getPublicUrl(fileName);

            const newUrl = publicUrlData.publicUrl;

            // E. データベースを更新
            const { error: updateError } = await supabase
                .from('girls')
                .update({ image1_url: newUrl })
                .eq('id', girl.id);

            if (updateError) throw updateError;

            console.log(`✅ 成功: ${girl.name}`);

        } catch (err) {
            console.error(`❌ 失敗: ${girl.name}`, err.message);
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n🎉 全ての処理が完了しました！');
}

migrateImages();