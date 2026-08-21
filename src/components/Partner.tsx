import { RefreshCw, ShieldCheck, Star, Users } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const HIGHLIGHTS = [
  { icon: Users, label: "Giám sát người + AI song song" },
  { icon: RefreshCw, label: "Dữ liệu đồng bộ theo thời gian thực" },
  { icon: ShieldCheck, label: "Cảnh báo sớm khi cần can thiệp" },
];

export default function Partner() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 md:grid-cols-2 md:py-28">
        <ScrollReveal>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Đối tác AI đồng hành cùng doanh nghiệp trong dài hạn
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Không dừng lại ở bàn giao dự án, DNK House tiếp tục theo sát để
            mô hình AI học từ dữ liệu mới, vận hành ổn định và tiếp tục mang
            lại giá trị theo thời gian.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <item.icon size={16} className="text-accent" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="rounded-3xl border border-border bg-background p-6 shadow-xl shadow-black/5">
            <div className="flex gap-1 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground">
              &ldquo;[Trích dẫn phản hồi thật từ khách hàng sẽ đặt ở đây khi
              có dữ liệu]&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                KH
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  [Tên khách hàng]
                </p>
                <p className="text-xs text-muted">[Chức danh, Công ty]</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
