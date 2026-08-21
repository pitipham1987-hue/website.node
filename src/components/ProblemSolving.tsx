import { CheckCircle2 } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const POINTS = [
  "Đi thẳng vào nguyên nhân, không chỉ tự động hoá triệu chứng bề mặt",
  "Chuyên gia AI phụ trách theo sát từng dự án đến khi hoàn thành",
  "Báo cáo minh bạch, đo lường được hiệu quả AI ở mọi giai đoạn",
];

const PROGRESS = [
  { label: "Huấn luyện mô hình theo dữ liệu doanh nghiệp", value: 100 },
  { label: "Tích hợp vào hệ thống hiện có", value: 72 },
  { label: "Đào tạo đội ngũ vận hành", value: 35 },
];

export default function ProblemSolving() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 md:grid-cols-2 md:py-28">
        <ScrollReveal className="order-2 md:order-1">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-xl shadow-black/5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Tiến độ triển khai AI</p>
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                Đang triển khai
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {PROGRESS.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-muted">{item.value}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-border pt-5">
              {POINTS.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <span className="text-sm leading-relaxed text-foreground">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="order-1 md:order-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Giải quyết đúng vấn đề bằng AI, không chỉ tự động hoá hời hợt
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            DNK House đặt trọng tâm vào việc hiểu sâu bài toán của doanh
            nghiệp trước khi đề xuất giải pháp AI. Đội ngũ chuyên gia đồng
            hành xuyên suốt để đảm bảo kết quả đúng với mục tiêu ban đầu, ngay
            từ lần triển khai đầu tiên.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
