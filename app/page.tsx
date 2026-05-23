export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        TeamC imakoko 👋
      </h1>

      <p className="mt-4 max-w-xl text-lg text-zinc-600">
        いまの気分や状況から、今日のごはんを決めるアプリ
      </p>

      <div className="mt-8 flex gap-4">
        <button className="rounded-full bg-black px-6 py-3 text-white">
          何食べよう
        </button>
        <button className="rounded-full border px-6 py-3">
          一覧を見る
        </button>
      </div>
    </main>
  );
}
