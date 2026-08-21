import ScrollReveal from "./ScrollReveal";

const STEPS = [
  {
    number: "01",
    title: "Tìm hiểu",
    description: "Khảo sát hiện trạng, xác định mục tiêu và ràng buộc thực tế của doanh nghiệp.",
  },
  {
    number: "02",
    title: "Đề xuất",
    description: "Xây dựng phương án AI cụ thể, có lộ trình và chi phí rõ ràng trước khi bắt đầu.",
  },
  {
    number: "03",
    title: "Triển khai",
    description: "Huấn luyện, tích hợp AI theo từng giai đoạn, cập nhật tiến độ thường xuyên.",
  },
  {
    number: "04",
    title: "Đồng hành",
    description: "Giám sát, tối ưu mô hình AI liên tục theo dữ liệu và phản hồi thực tế.",
  },
];

export default function Process() {
  return (
    <section id="quy-trinh" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <ScrollReveal className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Quy trình triển khai AI rõ ràng, minh bạch
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Mỗi dự án AI đều đi qua bốn giai đoạn cố định để đảm bảo chất
            lượng và đúng tiến độ cam kết.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-background p-6">
                <span className="text-sm font-semibold text-accent">
                  {step.number}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
