import { Bot, TrendingUp } from "lucide-react";

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        className="absolute inset-0 -z-10 scale-110 rounded-[3rem] bg-accent/10 blur-2xl"
        aria-hidden
      />

      <div className="rounded-[2rem] border border-border bg-white p-4 shadow-2xl shadow-black/10 sm:p-5">
        <div className="flex items-center gap-1.5 border-b border-border px-1 pb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
        </div>

        <div className="space-y-3 p-1 pt-4">
          <div className="rounded-2xl bg-surface p-5">
            <p className="text-xs font-medium text-muted">Yêu cầu AI đang xử lý</p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">128</p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Bot size={20} className="text-accent" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Chatbot đã học xong dữ liệu sản phẩm</p>
              <p className="text-xs text-muted">Cập nhật hôm nay</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <TrendingUp size={20} className="text-accent" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Tự động hoá 64% tác vụ lặp lại</p>
              <p className="text-xs text-muted">So với quy trình thủ công</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-7 -left-8 hidden rounded-2xl border border-border bg-white p-4 shadow-xl shadow-black/10 sm:block">
        <p className="text-xs font-medium text-muted">Vận hành</p>
        <p className="text-2xl font-bold tracking-tight text-foreground">24/7</p>
      </div>

      <div className="absolute -top-8 -right-6 hidden rounded-2xl border border-border bg-white px-4 py-3 shadow-xl shadow-black/10 sm:block">
        <p className="text-xs font-medium text-muted">Độ chính xác AI</p>
        <p className="text-2xl font-bold tracking-tight text-foreground">96%</p>
      </div>
    </div>
  );
}
