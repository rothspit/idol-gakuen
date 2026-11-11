import { NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { simpleParser } from 'mailparser'
import { createClient } from '@supabase/supabase-js'

// S3クライアントの準備
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Supabaseクライアントの準備
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  console.log("📨 Webhook (動画対応版): 起動")

  try {
    const bodyText = await request.text()
    let body
    try {
      body = JSON.parse(bodyText)
    } catch (e) {
      return NextResponse.json({ status: 'Not JSON' })
    }

    // AWSからの「承認確認」への自動応答
    if (body.Type === 'SubscriptionConfirmation' && body.SubscribeURL) {
      console.log("🤝 AWS承認リクエストを許可します")
      await fetch(body.SubscribeURL)
      return NextResponse.json({ success: true })
    }

    // メールの通知 (Notification) が来た場合
    if (body.Type === 'Notification') {
      const message = JSON.parse(body.Message)
      const messageId = message.mail.messageId
      console.log(`📦 S3からメールを取得します。ID: ${messageId}`)

      // 1. S3から生データを取得
      const getCommand = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: messageId,
      })
      const s3Response = await s3.send(getCommand)
      const rawBody = await s3Response.Body?.transformToByteArray()

      if (!rawBody) {
        console.error("❌ S3からメールの中身が取れませんでした")
        return NextResponse.json({ error: 'S3 Empty' })
      }

      // 2. 解析 (Bufferを使うので絵文字もOK)
      const parsed = await simpleParser(Buffer.from(rawBody))

      const subject = parsed.subject || '無題'
      const from = parsed.from?.value[0]?.address || ''
      const text = parsed.text || ''

      // 3. 画像と動画を分別する
      const attachments = parsed.attachments || []
      const imageFiles = attachments.filter(a => a.contentType.startsWith('image/'))
      const videoFiles = attachments.filter(a => a.contentType.startsWith('video/'))

      console.log(`📝 解析完了: 件名「${subject}」 / 画像${imageFiles.length}枚 / 動画${videoFiles.length}本`)

      // 送信元の女の子を特定
      const { data: girl } = await supabase
        .from('girls')
        .select('id, brand_id')
        .eq('post_email', from)
        .single()

      if (!girl) {
        console.log(`⚠️ 未登録のアドレスからのメールです: ${from}`)
        return NextResponse.json({ success: true, message: 'User not found' })
      }

      // 4. ファイルアップロード用関数
      const uploadFiles = async (files: typeof attachments) => {
        const urls: string[] = []
        for (const file of files) {
          const fileName = `${girl.id}/${Date.now()}-${file.filename || 'file'}`

          const { error } = await supabase.storage
            .from('diary-images')
            .upload(fileName, file.content, { contentType: file.contentType })

          if (!error) {
            const { data } = supabase.storage.from('diary-images').getPublicUrl(fileName)
            urls.push(data.publicUrl)
          } else {
            console.error("❌ アップロード失敗:", error)
          }
        }
        return urls
      }

      // 画像と動画をそれぞれ保存
      const imageUrls = await uploadFiles(imageFiles)
      const videoUrls = await uploadFiles(videoFiles)

      // 5. データベースに保存
      const { error: insertError } = await supabase
        .from('diaries')
        .insert({
          girl_id: girl.id,
          brand_id: girl.brand_id,
          title: subject,
          content: text,
          images: imageUrls,
          videos: videoUrls,
        })

      if (insertError) {
        console.error("❌ DB保存エラー:", insertError)
      } else {
        console.log("✅ 日記の投稿に成功しました！")
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("❌ 全体エラー:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
