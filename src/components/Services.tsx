import { Bot, Workflow, BarChart3, Plug } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const SERVICES = [
  {
    icon: Bot,
    title: "Chatbot & trợ lý ảo AI",
    description:
      "Tự động trả lời và chăm sóc khách hàng 24/7, học từ dữ liệu và tài liệu thật của doanh nghiệp bạn.",
  },
  {
    icon: Workflow,
    title: "Tự động hoá quy trình",
    description:
      "Loại bỏ thao tác thủ công lặp lại bằng AI, giải phóng thời gian cho đội ngũ tập trung việc quan trọng.",
  },
  {
    icon: BarChart3,
    title: "Phân tích dữ liệu thông minh",
    description:
      "Biến dữ liệu thô thành báo cáo và gợi ý hành động rõ ràng, cập nhật theo thời gian thực.",
  },
  {
    icon: Plug,
    title: "Tích hợp AI vào hệ thống",
    description:
      "Kết nối AI với phần mềm, quy trình doanh nghiệp đang dùng — không cần thay đổi toàn bộ hạ tầng.",
  },
];

export default function Services() {
  return (
    <section id="dich-vu" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <ScrollReveal className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Hỗ trợ toàn diện, không cần mở rộng đội ngũ
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Triển khai giải pháp AI trong thời gian ngắn, làm chủ dữ liệu và
            quy trình để mang lại kết quả chính xác, ổn định.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-background p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10">
                  <service.icon size={20} className="text-accent" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
